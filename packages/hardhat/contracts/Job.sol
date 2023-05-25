//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";
// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that represents the Job created by an employer for a freelancer after agreement
 * @author Mehdi 
 */
contract Job {


    enum Status {OPEN, IN_PROGRESS, COMPLETED, ABANDONNED, DELETED}

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

    function setBountyPrice(uint256 _bountyPrice) external view returns (uint256) {
        bountyAmount = _bountyPrice; 
    }

    function settleJob() public {
        require(Job.status = Status.IN_PROGRESS);

        Job.status = Status.COMPLETED;
    }

    function fundJob() public {
        require(Job.status = Status.IN_PROGRESS);
        
    }

    

    





   
}
