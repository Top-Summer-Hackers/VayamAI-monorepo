//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";


interface IJob {

    enum JobStatus{
        NotStarted, 
        Funded,
        Started, 
        Partial, 
        Paid,
        Settled, 
        Canceled
    }

    function currentJobStatus() external view returns (JobStatus);

    function millestonePayout(
        address _recipient,
        uint256 amount,
        string memory _hash,
        uint256 _txId
    ) external ;

}