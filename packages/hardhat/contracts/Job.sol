//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";
// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

import './interfaces/IJob.sol';


/**
 * A smart contract that represents the Job created by an employer for a freelancer after agreement
 * @author Mehdi 
 */
contract Job is IJob {

    // enum Status {OPEN, IN_PROGRESS, COMPLETED, ABANDONNED, DELETED}
    // enum InvoiceStatus {NOT_STARTED,FUNDED, STARTED, PARTIAL, PAID, SETTLED}

    uint256 public duration;

    JobStatus public override status;

    struct Job {
        Status status; 
    }

    address employer ;
    address employee; 
    string description;
    uint256 bountyAmount;

    uint public constant LIMIT_BOUNTY = 1_000_000;

    struct Tags {
        bytes32[] law;
        bytes32[] tech;
        bytes32[] design;
        bytes32[] marketing;
        bytes32[] finance;
        bytes32[] business;
        bytes32[] other;
    }

    constructor(address _employer, address _employee, string _description, Tags _tags, uint256 _bountyAmount, uint256 _endDate){
        require(bountyAmount < LIMIT_BOUNTY);
        require(Job.status = Status.OPEN);
        employer = msg.sender; 
        employee = _employee;
        description = _description;
        bountyAmount = _bountyAmount;

    }

    function setupJob (
        address _freelancer, 
        address _employer, 
        address _invoiceContract
    ) public {
        require(_freelancer != address(0), 'Invalid freelancer');
        require(_employer != address(0), 'Invalid employer');
        require(_invoiceContract != address(0), 'Invalid invoice');

    }

    function setBountyPrice(uint256 _bountyPrice) external view returns (uint256) {
        bountyAmount = _bountyPrice; 
    }

    function settleJob() public {
        require(Job.status = Status.IN_PROGRESS);

        Job.status = Status.COMPLETED;
    }

    function millestonePayout() external notPaid {
        require(status != JobStatus.Paid);
        uint256 balance = getBalance();
        // TO DO : add escrowInvoice logic 
    }

    function fundJob() public {
        require(Job.status = Status.IN_PROGRESS);
        
    }


    modifier notExpired() {
        require(duration > block.timestamp, 'Contract expired'); // solhint-disable-line not-rely-on-time
        _;
    }

    modifier notPaid() {
        require()
    }
}
