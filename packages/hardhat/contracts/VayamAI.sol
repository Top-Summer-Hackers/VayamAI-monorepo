// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "./SmartInvoice/interfaces/ISmartInvoiceFactory.sol";
import "./SmartInvoice/interfaces/ISmartInvoiceEscrow.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title VayamAI
 * @author Carlos Ramos
 */
contract VayamAI is Ownable, ERC721 {
  error AlreadyRegistered(bool);
  error IncorrectInvoice(address);
  error IncorrectAmounts();
  error NotWhitelisted();
  error NotUser(bytes32);
  error Acknowledged(bool);
  error InvoicesWithoutReview(address);
  error IncorrectReview();
  error InvoiceHasNotFinished();
  error NonTransferrable();
  error NotAbleToClaim();
  error WrongDetails();
  error CoolDownNotFinished();

  event UserRegistered(address indexed user, bytes32 details, uint256 userId);
  event DealAcknowledged(address indexed invoice);

  struct Invoice {
    address client;
    address freelancer;
    address token;
    uint256 createdAt;
    bool isAcknowledged;
    bool isClosedByClient;
    bool isClosedByFreelancer;
  }

  enum Score {
    ZERO_STARS,
    ONE_STAR,
    TWO_STARS,
    THREE_STARS,
    FOUR_STARS,
    FIVE_STARS
  }

  address private weth;
  address private smartInvoiceFactory;
  string private uri;

  bytes32 constant FREELANCER_TYPE = keccak256("freelancer");
  bytes32 constant CLIENT_TYPE = keccak256("client");
  bytes32 constant ESCROW_TYPE = keccak256("escrow");
  uint256 constant ACKNOWLEDGEMENT_DEPOSIT = 1000; // in basis points 10^4
  uint256 constant MAX_NUMBER_OF_INVOICES_NO_REVIEW = 5;
  uint256 constant MIN_NUMBER_OF_CLOSED_INVOICES_WITH_5_5 = 10;
  uint256 constant CANCELATION_THRESHOLD = 2 days;

  mapping(address => bytes32) public userType;
  mapping(address => mapping(uint256 => address)) public invoicesOfUserByIndex;
  mapping(address => uint256) public invoiceCountOfUser;
  mapping(address => Invoice) public invoiceRecord;

  mapping(address => uint256) public userIds;
  mapping(uint256 => address) public idToUser;
  mapping(address => bool) public whitelistedToken;
  mapping(address => uint256) public invoicesNoReviewCount;
  mapping(address => uint256) public closedInvoicesCount;
  mapping(address => uint256) public closedInvoicesCountMaxScore;
  mapping(address => uint256) public userScore;

  uint256 public userCount = 1;
  uint256 public tokenId = 1;

  constructor(address _weth, address _smartInvoiceFactory) ERC721("VayamAI Mentor", "MENTOR") {
    weth = _weth;
    smartInvoiceFactory = _smartInvoiceFactory;
  }

  function _checkUserType(address _user, bytes32 _userType) internal view returns (bool) {
    if (!(userType[_user] == _userType)) {
      revert NotUser(_userType);
    }
  }

  modifier isFreelancer() {
    _checkUserType(msg.sender, FREELANCER_TYPE);
    _;
  }

  modifier isWhitelistedToken(address _token) {
    if (!whitelistedToken[_token]) {
      revert NotWhitelisted();
    }
    _;
  }

  modifier isClient() {
    _checkUserType(msg.sender, CLIENT_TYPE);
    _;
  }

  /**
   * @dev creates a new deal and invoice, called by freelancer
   * @param _client the client address
   * @param _token the token Addr
   * @param _duration the duration of the deal ( in UNIX time )
   * @param _details a keccak256 hash of the details of the deal
   * @param _amounts the amounts of the deal ( aka milestones )
   */
  function createDeal(
    address _client,
    address _token,
    uint256 _duration,
    bytes32 _details,
    uint256[] calldata _amounts
  ) external isFreelancer isWhitelistedToken(_token) returns (address) {
    if (_amounts.length == 0) {
      revert IncorrectAmounts();
    }

    bytes memory data = abi.encode(
      _client,
      uint8(0),
      _client,
      _token,
      block.timestamp + _duration,
      _details,
      weth,
      false,
      smartInvoiceFactory
    );
    address _invoice = ISmartInvoiceFactory(smartInvoiceFactory).create(msg.sender, _amounts, data, ESCROW_TYPE);

    invoiceRecord[_invoice] = Invoice(_client, msg.sender, _token, block.timestamp, false, false, false);

    invoicesNoReviewCount[msg.sender]++;

    _checkInvoicesNoReviewCount(msg.sender);

    return _invoice;
  }

  /**
   * @dev acknowledges a deal, called by client
   * @dev client must deposit at least 10% of the total amount
   * @param _invoice the invoice to acknowledge for
   */
  function acknowledgeDeal(address _invoice) external isClient {
    Invoice memory invoice = invoiceRecord[_invoice];
    if (invoice.client != msg.sender) {
      revert IncorrectInvoice(_invoice);
    }
    if (invoice.isAcknowledged) {
      revert Acknowledged(true);
    }

    invoice.isAcknowledged = true;

    invoiceRecord[_invoice] = invoice;

    // deposit at least 10%  of the total amount
    uint256[] memory amounts = ISmartInvoiceEscrow(_invoice).getAmounts();
    uint256 total = 0;
    for (uint256 i = 0; i < amounts.length; i++) {
      total += amounts[i];
    }
    uint256 tenPercent = (total * ACKNOWLEDGEMENT_DEPOSIT) / 10000;
    IERC20(invoice.token).transferFrom(msg.sender, _invoice, tenPercent);

    //update invoiceNoReviewCount
    invoicesNoReviewCount[invoice.client]++;
    _checkInvoicesNoReviewCount(msg.sender);

    emit DealAcknowledged(_invoice);
  }

  /**
   * @dev cancels a deal, called by freelancer
   * @dev freelancer can only cancel a deal after 2 days of creation if not acknowledged
   * @param _invoice the invoice to cancel
   */
  function cancelDeal(address _invoice) external isFreelancer {
    Invoice memory invoice = invoiceRecord[_invoice];
    if (invoice.isAcknowledged) {
      revert Acknowledged(true);
    }

    if (block.timestamp - invoice.createdAt < CANCELATION_THRESHOLD) {
      revert CoolDownNotFinished();
    }

    //update invoiceNoReviewCount
    invoicesNoReviewCount[invoice.freelancer]--;
    invoiceRecord[_invoice] = Invoice(address(0), address(0), address(0), 0, false, false, false);
  }

  /**
   * @dev closes a deal, called by freelancer or client
   * @param _invoice the invoice to close
   * @param _review a MUST leave review keccak256
   * @param _score a score for the the other party of this deal
   */
  function closeDeal(address _invoice, bytes32 _review, Score _score) external {
    Invoice memory invoice = invoiceRecord[_invoice];
    if (_review == bytes32("")) {
      revert IncorrectReview();
    }
    if (!invoice.isAcknowledged) {
      revert Acknowledged(false);
    }

    if (invoice.client == msg.sender && !invoice.isClosedByClient) {
      _updateUserScore(invoice.freelancer, _score);
      invoicesNoReviewCount[invoice.client]--;
      invoice.isClosedByClient = true;
    } else if (invoice.freelancer == msg.sender && !invoice.isClosedByFreelancer) {
      _updateUserScore(invoice.client, _score);
      invoicesNoReviewCount[invoice.freelancer]--;
      invoice.isClosedByFreelancer = true;
    } else {
      revert IncorrectInvoice(_invoice);
    }

    _checkInvoiceCompletion(_invoice);

    // TODO : delete this, or could be useful later
    if (invoice.isClosedByClient && invoice.isClosedByFreelancer) {
      closedInvoicesCount[invoice.client]++;
      closedInvoicesCount[invoice.freelancer]++;

      _checkAirdropNFT(invoice.client);
      _checkAirdropNFT(invoice.freelancer);
    }

    //update invoice
    invoiceRecord[_invoice] = invoice;
  }

  /**
   * @dev registers a user
   * @param _userDetails a keccak256 hash of the user details
   * @param _userType the type of the user
   * @param _userId the id of the user
   * @notice the user id must be equal to the current user count
   */
  function registerAsUser(bytes32 _userDetails, bytes32 _userType, uint256 _userId) external {
    if (!(userType[msg.sender] == bytes32(""))) {
      revert AlreadyRegistered(true);
    }

    if (_userDetails == bytes32("")) {
      revert WrongDetails();
    }

    if (userCount != _userId) {
      revert WrongDetails();
    }

    userType[msg.sender] = _userType;
    userIds[msg.sender] = userCount;
    idToUser[userCount] = msg.sender;
    userCount++;
    emit UserRegistered(msg.sender, _userDetails, _userId);
  }

  /**
   * @dev adds a token to the whitelist
   * @param _token the token to add
   * @notice for security reasons only certain tokens are allowed in the protocol
   */
  function addTokenToWhitelist(address _token) external onlyOwner {
    whitelistedToken[_token] = true;
  }

  function _updateUserScore(address _user, Score _score) internal {
    if (_score == Score.FIVE_STARS) {
      closedInvoicesCountMaxScore[_user]++;
    }
  }

  function _checkInvoicesNoReviewCount(address _user) internal {
    if (invoicesNoReviewCount[_user] > MAX_NUMBER_OF_INVOICES_NO_REVIEW) {
      revert InvoicesWithoutReview(_user);
    }
  }

  function _checkInvoiceCompletion(address _invoice) internal {
    bool hasFinised = ISmartInvoiceEscrow(_invoice).terminationTime() < block.timestamp;
    uint256[] memory amounts = ISmartInvoiceEscrow(_invoice).getAmounts();
    uint256 milestone = ISmartInvoiceEscrow(_invoice).milestone();
    if (!hasFinised || amounts.length != milestone) {
      revert InvoiceHasNotFinished();
    }
  }

  function _checkAirdropNFT(address user) internal {
    if (balanceOf(user) == 0 && closedInvoicesCountMaxScore[user] >= MIN_NUMBER_OF_CLOSED_INVOICES_WITH_5_5) {
      _safeMint(user, tokenId);
      tokenId++;
    }
  }

  /**
   * @dev overrides the transfer function to prevent transfers ( aka SBT)
   */
  function _transfer(address from, address to, uint256 tokenId) internal override {
    revert NonTransferrable();
  }

  /**
   * @dev gets an invoice data as struct
   * @param _invoice the invoice address
   */
  function getInvoice(address _invoice) external view returns (Invoice memory) {
    return invoiceRecord[_invoice];
  }

  function setTokenURI(string memory _uri) external onlyOwner {
    uri = _uri;
  }

  function tokenURI(uint256 _tokenId) public view override returns (string memory) {
    return uri;
  }
}
