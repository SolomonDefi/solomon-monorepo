// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./library/Ownable.sol";
import "./library/IERC20.sol";
import "./library/SlmJudgement.sol";
import "./SlmStakerStorage.sol";


/// @title SlmStakerManager allows users to stake SLM to become jurors and earn rewards
contract SlmStakerManager is Ownable {

    /// @dev Full list of stakers
    uint256[] public stakerPool;

    /// @dev IERC20 Token object
    IERC20 public token;

    /// @dev SlmStakerStorage object
    SlmStakerStorage public stakerStorage;

    /// @dev SlmJudgement object
    SlmJudgement public judgement;

    /// Event announcing the amount of SLM staked by a user
    /// @param amount Amount staked
    /// @param user User wallet address
    event StakedSLM(uint256 amount, address user);

    /// Event announcing the amount of SLM unstaked by a user
    /// @param amount Amount unstaked
    /// @param user User wallet address
    event UnstakedSLM(uint256 amount, address user);

    /// Announces the percentage and amount for latest reward payment
    /// @param percent Percent of reward payment in whole numbers
    /// @param amount Amount of reward payment
    event RewardAnnounced(uint256 percent, uint256 amount);

    /// Event for user withdrawal of reward payment
    /// @param user User wallet address
    /// @param amount Amount withdrawn
    event RewardWithdrawn(address user, uint256 amount);

    /// Restricts access to only the owner and SlmJudgement contract
    modifier onlyOwnerOrJudgement() {
        require(msg.sender == owner || msg.sender == address(judgement), "Unauthorized access");
        _;
    }

    /// Initializes contract and set default values
    /// @param tokenAddress Slm token address
    /// @param stakerStorageAddress SlmStakerStorage address
    constructor(
        address tokenAddress,
        address stakerStorageAddress
    ) {
        require(tokenAddress != address(0), "Zero addr");
        require(stakerStorageAddress != address(0), "Zero addr");
        token = IERC20(tokenAddress);
        stakerStorage = SlmStakerStorage(stakerStorageAddress);
    }

    /// Sets address of SlmJudgement
    /// @param judgementAddress SlmJudgement address
    function setJudgementContract(address judgementAddress) external onlyOwner {
        require(judgementAddress != address(0), "Zero addr");
        judgement = SlmJudgement(judgementAddress);
    }

    /// Gets list of stakers
    function getStakerPool() external view onlyOwnerOrJudgement returns(uint256[] memory) {
        return stakerPool;
    }

    /// Allows users to stake Slm tokens
    /// @param beneficiary User wallet address
    /// @param amount Number of Slm tokens to stake
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

    /// Allows user to unstake all tokens
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

    /// Sets details of dispute and assigns outstanding votes to assigned jurors
    /// @param disputeAddress Dispute contract address
    /// @param endTime Dispute vote end time
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

    /// Updates outstanding vote requirements for staker
    /// @param walletAddress User wallet address
    /// @param slmContract Dispute contract address
    function managedVote(address walletAddress, address slmContract) external onlyOwnerOrJudgement {
        require(walletAddress != address(0), "Zero addr");
        require(slmContract != address(0), "Zero addr");

        if (this.getDisputeVoteCount(walletAddress, slmContract) == 1){
            stakerStorage.decreaseOutstandingVotes(walletAddress, 1);
            stakerStorage.decreaseDisputeVoteCount(walletAddress, slmContract, 1);
            stakerStorage.increaseVoteHistoryCount(walletAddress, 1);
        }
    }

    /// Get user ID based on wallet address
    /// @param walletAddress User wallet address
    function getUserId(address walletAddress) external view returns(uint256) {
        return stakerStorage.getUserId(walletAddress);
    }

    /// Get wallet address based on user ID
    /// @param userId User ID
    function getUserAddress(uint256 userId) external view returns(address) {
        return stakerStorage.getUserAddress(userId);
    }

    /// Sets reward percent of next reward payment
    /// @param rewardPercent Reward payment percent in whole numbers
    function announceReward(uint32 rewardPercent) external onlyOwner {
        require(rewardPercent > 0, "Invalid percent");
        uint256 rewardAmount = (token.balanceOf(address(stakerStorage)) * rewardPercent) / 100;
        stakerStorage.announceReward(rewardPercent, rewardAmount);
        emit RewardAnnounced(rewardPercent, rewardAmount);
    }

    /// Allows user to withdraw reward payments
    function withdrawRewards() external {
        uint256 stakeRewards = _calculateStakeRewards(msg.sender);
        if (stakeRewards > 0) {
            stakerStorage.sendFunds(msg.sender, stakeRewards);
            emit RewardWithdrawn(msg.sender, stakeRewards);
        }
    }

    /// Stake reward calculation based on user stakes
    /// @param walletAddress User wallet address
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

    /// Gets amount staked by user
    /// @param walletAddress User address address
    function getStake(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return stakerStorage.getStake(walletAddress);
    }

    /// Gets reward percent history of specific reward payment index
    /// @param index Reward payment index
    function getRewardPercentHistory(uint256 index) external view returns(uint256) {
        return stakerStorage.getRewardPercentHistory(index);
    }

    /// Gets reward amount history for specific reward payment index
    /// @param index Reward payment index
    function getRewardAmountHistory(uint256 index) external view returns(uint256) {
        return stakerStorage.getRewardAmountHistory(index);
    }

    /// Get amount unstaked by user for a certain unstake index
    /// @param walletAddress User wallet address
    /// @param index Unstake index
    function getUnstakedAmount(address walletAddress, uint256 index) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return stakerStorage.getUnstakedAmount(walletAddress, index);
    }

    /// Get time of unstake for a certain unstake index
    /// @param walletAddress User wallet address
    /// @param index Unstake index
    function getUnstakedTime(address walletAddress, uint256 index) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return stakerStorage.getUnstakedTime(walletAddress, index);
    }

    /// Get the total number of unstakes for a user
    /// @param walletAddress User wallet address
    function getUnstakeCount(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return stakerStorage.getUnstakeCount(walletAddress);
    }

    /// Get the total amount unstaked for a user
    /// @param walletAddress User wallet address
    function getUnstakedSLM(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return stakerStorage.getUnstakedSLM(walletAddress);
    }

    /// Get number of outstanding dispute votes for a user
    /// @param walletAddress User wallet address
    function getOutstandingVotes(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return stakerStorage.getOutstandingVotes(walletAddress);
    }

    /// Get number of outstanding dispute votes for a specific dispute address
    /// @param walletAddress User wallet address
    /// @param slmContract Dispute contract address
    function getDisputeVoteCount(address walletAddress, address slmContract) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        require(slmContract != address(0), "Zero addr");
        return stakerStorage.getDisputeVoteCount(walletAddress, slmContract);
    }

    /// Get dispute vote history for user
    /// @param walletAddress User wallet address
    function getVoteHistoryCount(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return stakerStorage.getVoteHistoryCount(walletAddress);
    }
}