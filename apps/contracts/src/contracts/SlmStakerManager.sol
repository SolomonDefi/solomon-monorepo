// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./library/Ownable.sol";
import "./library/IERC20.sol";
import "./library/SlmJudgement.sol";
import "./SlmStakerStorage.sol";

// TODO: Add back interest/reward sections + Unstaking mechanism
// TODO: Add back functions related to voting

/// @title SlmStakerManager allows users to stake SLM to become jurors and earn rewards
contract SlmStakerManager is Ownable {

    event StakedSLM(uint256 amount, uint256 beneficiary, address user);

    event UnstakeSLM(uint256 amount, uint256 beneficiary, address user);

    uint256[] public stakerPool;

    IERC20 public token;

    SlmStakerStorage public stakerStorage;

    SlmJudgement public judgement;

    modifier onlyOwnerOrJudgement() {
        require(msg.sender == owner || msg.sender == address(judgement), "Unauthorized access");
        _;
    }

    constructor(
        address tokenAddress,
        address stakerStorageAddress
    ) {
        require(tokenAddress != address(0), "Zero addr");
        require(stakerStorageAddress != address(0), "Zero addr");
        token = IERC20(tokenAddress);
        stakerStorage = SlmStakerStorage(stakerStorageAddress);
    }

    function setJudgementContract(address judgementAddress) external onlyOwner {
        require(judgementAddress != address(0), "Zero addr");
        judgement = SlmJudgement(judgementAddress);
    }

    function getStakerPool() external view onlyOwnerOrJudgement returns(uint256[] memory) {
        return stakerPool;
    }

    function stake(uint256 beneficiary, uint256 amount) public {
        address backer = msg.sender;

        uint256 unstakeCount = stakerStorage.getUnstakeCount(backer, beneficiary);
        if(unstakeCount > 0) {
            uint256 unstakeTime = stakerStorage.getUnstakedTime(backer, beneficiary, unstakeCount-1);
            uint256 unstakePeriod = stakerStorage.unstakePeriod();
            require(block.timestamp > unstakeTime + unstakePeriod, "Unstake wait period has not ended");
        }

        uint256 userStake = stakerStorage.getStake(backer, beneficiary);
        if(userStake == 0) {
            stakerPool.push(beneficiary);
            stakerStorage.setUserId(backer, beneficiary);
            stakerStorage.updateStakerPool(stakerPool);
        }

        stakerStorage.increaseStakeAmount(backer, beneficiary, amount);

        token.transferFrom(backer, address(stakerStorage), amount);
        emit StakedSLM(amount, beneficiary, backer);
    }

    function unstake(uint256 beneficiary) public returns(uint256) {
        address backer = msg.sender;

        uint256 userStake = stakerStorage.getStake(backer, beneficiary);
        require(userStake > 0, "No stake");

        stakerStorage.decreaseStakeAmount(backer, beneficiary, userStake);

        stakerStorage.pushUnstakedInfo(backer, beneficiary, userStake, block.timestamp);
        stakerStorage.sendFunds(backer, userStake);

        for(uint256 i = 0; i < stakerPool.length; i += 1) {
            if(stakerPool[i] == beneficiary) {
                delete stakerPool[i];
            }
        }
        stakerStorage.updateStakerPool(stakerPool);

        emit UnstakeSLM(userStake, beneficiary, backer);
        return userStake;
    }

    function setVoteDetails(address disputeAddress, uint256 endTime) public onlyOwnerOrJudgement {
        uint256 prevEndTime = stakerStorage.getVoteEndTime(disputeAddress);
        require(prevEndTime == 0 || block.timestamp > prevEndTime, "Dispute vote in progress");

        uint256[] memory jurorList = judgement.getJurors(disputeAddress);

        stakerStorage.setVoteEndTime(disputeAddress, endTime);

        for(uint256 i = 0; i < jurorList.length; i++) {
            uint256 currentJuror = jurorList[i];
            uint256 disputeVoteCount = stakerStorage.getDisputeVoteCount(disputeAddress, currentJuror);
            if(disputeVoteCount == 0) {
                stakerStorage.increaseOutstandingVotes(1, disputeAddress, currentJuror);
                stakerStorage.increaseDisputeVoteCount(1, disputeAddress, currentJuror);
            } else {
                stakerStorage.decreaseOutstandingVotes(disputeVoteCount, disputeAddress, currentJuror);
                stakerStorage.increaseOutstandingVotes(1, disputeAddress, currentJuror);
                stakerStorage.decreaseDisputeVoteCount(disputeVoteCount, disputeAddress, currentJuror);
                stakerStorage.increaseDisputeVoteCount(1, disputeAddress, currentJuror);
            }
        }
    }

    function getUserId(address walletAddress) external view returns(uint256) {
        return stakerStorage.getUserId(walletAddress);
    }

    function getUserAddress(uint256 userId) external view returns(address) {
        return stakerStorage.getUserAddress(userId);
    }
}