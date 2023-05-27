//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that represents the Job Launcher
 * @author Mehdi
 */
contract JobFactory is OwnableUpgradeable, UUPSUpgradeable{

    string constant JOB_ERROR_ZERO = "Job Factory error : ZERO_ADDRESS";
    uint public constant LIMIT_BOUNTY = 1_000_000;


    uint256 public counter; 
    mapping(address => uint256) JobCounters; 
    address public lastJob;
    address public employer;
    address[] public jobAddresses;

    event JobCreated(address indexed employer, address indexed job);
    event JobFunded(address indexed employer, address indexed job);
    event JobCompleted(address indexed freelancer, address indexed job);
    event JobSettled(address indexed freelancer, address indexed job);


  enum Status {
    OPEN,
    IN_PROGRESS,
    COMPLETED,
    ABANDONNED,
    DELETED
  }

  struct Job {
    string description, 
    uint256 bountyAmount,
    uint256 duration, 
    address employer, 
    address freelancer
  }


  struct Tags {
    bytes32[] law;
    bytes32[] tech;
    bytes32[] design;
    bytes32[] marketing;
    bytes32[] finance;
    bytes32[] business;
    bytes32[] other;
  }

   constructor(
    address _employer,
    address _employee,
    string _description,
    Tags _tags,
    uint256 _bountyAmount,
    uint256 _endDate
  ) {
    require(bountyAmount < LIMIT_BOUNTY);
    require(Job.status = Status.OPEN);
    employer = msg.sender;
    employee = _employee;
    description = _description;
    bountyAmount = _bountyAmount;
  }


    function createJob(
        string description, 
        uint256 bountyAmount,
        uint256 duration, 
        address employer, 
        address freelancer
    ) public returns (address) {
        require(freelancer != address(0), "Job Factory error: ZERO_ADDRESS");

        address jobAddress = address(new Job(description, bountyAmount, duration, msg.sender, freelancer));

        jobs[jobAddress] = Job(description, bountyAmount, duration, msg.sender, freelancer, false, false, false);
        jobAddresses.push(jobAddress);

        emit JobCreated(msg.sender, jobAddress); 
    }
    

  function hasJob(address _address) public view returns (bool){
    return JobCounters[_address] != 0;
  }

}






}
