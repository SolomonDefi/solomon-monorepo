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

    event StakedSLM(uint256 amount, address user);

    event UnstakedSLM(uint256 amount, address user);

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
        require(amount > 0, "Invalid amount");
        address backer = msg.sender;

        uint256 unstakeCount = stakerStorage.getUnstakeCount(backer);
        if (unstakeCount > 0) {
            uint256 unstakeTime = stakerStorage.getUnstakedTime(backer, unstakeCount-1);
            uint256 unstakePeriod = stakerStorage.unstakePeriod();
            require(block.timestamp > unstakeTime + unstakePeriod, "Unstake wait period has not ended");
        }

        uint256 userStake = stakerStorage.getStake(backer);
        if (userStake == 0) {
            stakerPool.push(beneficiary);
            stakerStorage.setUserId(backer, beneficiary);
            stakerStorage.updateStakerPool(stakerPool);
        }

        stakerStorage.increaseStakeAmount(backer, amount);

        token.transferFrom(backer, address(stakerStorage), amount);
        emit StakedSLM(amount, backer);
    }

    function unstake() public returns(uint256) {
        address backer = msg.sender;

        uint256 userStake = stakerStorage.getStake(backer);
        require(userStake > 0, "No stake");

        stakerStorage.decreaseStakeAmount(backer, userStake);

        stakerStorage.pushUnstakedInfo(backer, userStake, block.timestamp);
        stakerStorage.sendFunds(backer, userStake);

        for (uint256 i = 0; i < stakerPool.length; i += 1) {
            uint256 beneficiary = stakerStorage.getUserId(backer);
            if (stakerPool[i] == beneficiary) {
                delete stakerPool[i];

                if (stakerPool.length > 1 && i != (stakerPool.length - 1)) {
                    stakerPool[i] = stakerPool[stakerPool.length - 1];
                    stakerPool.pop();
                }  else if (stakerPool.length > 1 && i == (stakerPool.length - 1)) {
                    stakerPool.pop();
                }
            }
        }
        stakerStorage.updateStakerPool(stakerPool);

        emit UnstakedSLM(userStake, backer);
        return userStake;
    }

    function setVoteDetails(address disputeAddress, uint256 endTime) public onlyOwnerOrJudgement {
        require(disputeAddress != address(0), "Zero addr");
        require(endTime >= block.timestamp, "Invalid end time");
        uint256 prevEndTime = stakerStorage.getVoteEndTime(disputeAddress);
        require(prevEndTime == 0 || block.timestamp > prevEndTime, "Dispute vote in progress");

        uint256[] memory jurorList = judgement.getJurors(disputeAddress);

        stakerStorage.setVoteEndTime(disputeAddress, endTime);

        for (uint256 i = 0; i < jurorList.length; i++) {
            uint256 jurorId = jurorList[i];
            address currentJuror = stakerStorage.getUserAddress(jurorId);
            uint256 disputeVoteCount = stakerStorage.getDisputeVoteCount(currentJuror, disputeAddress);
            if (disputeVoteCount == 0) {
                stakerStorage.increaseOutstandingVotes(currentJuror, 1);
                stakerStorage.increaseDisputeVoteCount(currentJuror, disputeAddress, 1);
            } else {
                stakerStorage.decreaseOutstandingVotes(currentJuror, disputeVoteCount);
                stakerStorage.increaseOutstandingVotes(currentJuror, 1);
                stakerStorage.decreaseDisputeVoteCount(currentJuror, disputeAddress, disputeVoteCount);
                stakerStorage.increaseDisputeVoteCount(currentJuror, disputeAddress, 1);
            }
        }
    }

    function managedVote(address walletAddress, address slmContract) external onlyOwnerOrJudgement {
        require(walletAddress != address(0), "Zero addr");
        require(slmContract != address(0), "Zero addr");

        if (this.getDisputeVoteCount(walletAddress, slmContract) == 1){
            stakerStorage.decreaseOutstandingVotes(walletAddress, 1);
            stakerStorage.decreaseDisputeVoteCount(walletAddress, slmContract, 1);
            stakerStorage.increaseVoteHistoryCount(walletAddress, 1);
        }
    }

    function getUserId(address walletAddress) external view returns(uint256) {
        return stakerStorage.getUserId(walletAddress);
    }

    function getUserAddress(uint256 userId) external view returns(address) {
        return stakerStorage.getUserAddress(userId);
    }

    function announceReward(uint32 rewardPercent) external onlyOwner {
        require(rewardPercent > 0, "Invalid percent");
        uint256 rewardAmount = (token.balanceOf(address(stakerStorage)) * rewardPercent) / 100;
        stakerStorage.announceReward(rewardPercent, rewardAmount);
    }

    function withdrawRewards() external {
        uint256 stakeRewards = _calculateStakeRewards(msg.sender);
        if (stakeRewards > 0) {
            stakerStorage.sendFunds(msg.sender, stakeRewards);
        }
    }

    function _calculateStakeRewards(address walletAddress) private returns(uint256) {
        require(walletAddress != address(0), "Zero addr");

        uint256 userStake = stakerStorage.getStake(walletAddress);
        uint256 lastWithdrawal = stakerStorage.getLastWithdrawalTime(walletAddress);
        uint256 latestIndex = stakerStorage.getRewardPercentHistoryLength() - 1;
        uint256 rewardAmount = this.getRewardAmountHistory(latestIndex);
        uint256 stakerLatestIndex = stakerStorage.getLastRewardIndex(walletAddress);
        uint256 stakeRewards;

        if (block.timestamp > lastWithdrawal + stakerStorage.minWithdrawalWaitTime() && stakerLatestIndex < latestIndex) {
            stakeRewards = (userStake * rewardAmount) / (stakerStorage.totalStaked());
            stakerStorage.setLastWithdrawalTime(walletAddress, block.timestamp);
            stakerStorage.setLastRewardIndex(walletAddress, latestIndex);
        }
        return stakeRewards;
    }

    function getStake(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return stakerStorage.getStake(walletAddress);
    }

    function getRewardPercentHistory(uint256 index) external view returns(uint256) {
        return stakerStorage.getRewardPercentHistory(index);
    }

    function getRewardAmountHistory(uint256 index) external view returns(uint256) {
        return stakerStorage.getRewardAmountHistory(index);
    }

    function getUnstakedAmount(address walletAddress, uint256 index) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return stakerStorage.getUnstakedAmount(walletAddress, index);
    }

    function getUnstakedTime(address walletAddress, uint256 index) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return stakerStorage.getUnstakedTime(walletAddress, index);
    }

    function getUnstakeCount(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return stakerStorage.getUnstakeCount(walletAddress);
    }

    function getUnstakedSLM(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return stakerStorage.getUnstakedSLM(walletAddress);
    }

    function getOutstandingVotes(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return stakerStorage.getOutstandingVotes(walletAddress);
    }

    function getDisputeVoteCount(address walletAddress, address dispute) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        require(dispute != address(0), "Zero addr");
        return stakerStorage.getDisputeVoteCount(walletAddress, dispute);
    }

    function getVoteHistoryCount(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return stakerStorage.getVoteHistoryCount(walletAddress);
    }
}