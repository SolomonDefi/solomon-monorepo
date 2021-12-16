// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./library/Ownable.sol";
import "./library/IERC20.sol";
import "./SlmStakerManager.sol";

/// @title SlmStakerStorage stores information related to the Stakers
contract SlmStakerStorage is Ownable {

    /// @dev SlmStakerManager address
    address public stakerManager;

    /// @dev SlmToken object
    IERC20 public token;

    /// @dev Minimum stake required
    uint256 public minStake;

    /// @dev Minimum wait period before staking after latest unstake
    uint256 public unstakePeriod;

    /// @dev Total amount staked by all stakers
    uint256 public totalStaked;

    /// @dev Minimum stake required
    uint256 public minWithdrawalWaitTime;

    /// Mapping of staker wallet address to datestamp of last withdrawal
    mapping(address => uint256) private stakerLastWithdrawalTime;

    /// Mapping of staker wallet address to latest reward index withdrawn
    mapping(address => uint256) private stakerLastRewardIndex;

    /// Mapping of SlmStakerManager address to staker pool
    mapping(address => uint256[]) private stakerPool;

    /// Mapping of staker wallet address to user ID
    mapping(address => uint256) private userIdList;

    /// Mapping to get staker wallet address from user ID
    mapping(uint256 => address) private addressLookup;

    /// Mapping for staker wallet address to stake amount
    mapping(address => uint256) private stakes;

    /// Mapping for staker wallet address and unstake history
    mapping(address => unstakedInfo[]) private unstakedSLM;

    /// Staker address to total outstanding dispute votes
    mapping(address => uint256) private outstandingVotes;

    /// Mapping of dispute contract address to staker wallet address to number of outstanding dispute votes for specific dispute
    mapping(address => mapping(address => uint256)) private disputeVoteCount;

    /// Mapping of staker address to previous voting history count
    mapping(address => uint256) private voteHistoryCount;

    /// Timestamp in seconds for voting end times for each dispute contract
    mapping(address => uint256) private voteEndTimes;

    /// History of reward payment percentages (in whole numbers)
    uint8[] private rewardPercentHistory;

    /// History of reward payment amounts
    uint256[] private rewardAmountHistory;

    /// @dev Unstake information structure
    struct unstakedInfo {
        uint256 amount;
        uint256 time;
    }

    /// @dev Restrict access to only owner or SlmStakerManager contract
    modifier onlyOwnerOrManager() {
        require(msg.sender == owner || msg.sender == stakerManager, "Unauthorized access");
        _;
    }

    /// @dev Restrict access to only SlmStakerManager contract 
    modifier onlyManager() {
        require(msg.sender == stakerManager, "Unauthorized access");
        _;
    }

    /// Initialize the contract
    /// @param tokenAddress Token for ERC20 payments
    /// @param initialUnstakePeriod Default initial unstake period
    /// @param minimumStake Default minimum required staked
    constructor(address tokenAddress, uint256 initialUnstakePeriod, uint256 minimumStake) {
        require(tokenAddress != address(0), "Zero addr");
        require(initialUnstakePeriod > 0, "Invalid unstake period");
        require(minimumStake > 0, "Invalid minimum stake");
        token = IERC20(tokenAddress);
        unstakePeriod = initialUnstakePeriod;
        minStake = minimumStake;
    }

    /// Set SlmStakerManager contract
    /// @param newStakerManager SlmStakerManager contract
    function setStakerManager(address newStakerManager) external onlyOwner {
        require(newStakerManager != address(0), "Zero addr");
        stakerManager = newStakerManager;
    }

    /// Set minimum stake requirement
    /// @param newMinStake Minimum stake requirement
    function setMinStake(uint256 newMinStake) external onlyOwnerOrManager {
        require(newMinStake > 0, "Invalid minimum stake");
        minStake = newMinStake;
    }

    /// Set unstake period
    /// @param newUnstakePeriod Unstake period in seconds
    function setUnstakePeriod(uint256 newUnstakePeriod) external onlyOwnerOrManager {
        require(newUnstakePeriod > 0, "Invalid days");
        unstakePeriod = newUnstakePeriod;
    }

    /// Set minimum wait times for withdrawals
    /// @param newWaitTime Minimum wait time for withdrawals in seconds
    function setMinWithdrawalWaitTime(uint256 newWaitTime) external onlyOwner {
        require(newWaitTime >= 0, "Invalid wait time");
        minWithdrawalWaitTime = newWaitTime;
    }

    /// Assign user address for user wallet address
    /// @param walletAddress User wallet address
    /// @param userId User ID assigned to user
    function setUserId(address walletAddress, uint256 userId) external onlyOwnerOrManager {
        require(walletAddress != address(0), "Zero addr");
        userIdList[walletAddress] = userId;
        addressLookup[userId] = walletAddress;
    }

    /// Get user ID for user wallet address
    /// @param walletAddress User wallet address
    function getUserId(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return userIdList[walletAddress];
    }

    /// Get user wallet address from user ID
    /// @param userId User ID assigned to user
    function getUserAddress(uint256 userId) external view returns(address) {
        return addressLookup[userId];
    }

    /// Update staker pool array
    /// @param newStakerPool New array of stakers
    function updateStakerPool(uint256[] memory newStakerPool) external onlyOwnerOrManager {
        require(newStakerPool.length > 0, "Invalid staker pool");
        stakerPool[address(stakerManager)] = newStakerPool;
    }

    /// Get latest staker pool
    /// @param managerAddress SlmStakerManager contract address
    function getStakerPool(address managerAddress) external view onlyOwnerOrManager returns(uint256[] memory) {
        require(managerAddress != address(0), "Zero addr");
        if (managerAddress == address(0)) {
            return stakerPool[stakerManager];
        }
        return stakerPool[managerAddress];
    }

    /// Get current user stake
    /// @param walletAddress User wallet address
    function getStake(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return stakes[walletAddress];
    }

    /// Increase user stake amount
    /// @param walletAddress User wallet address
    /// @param amount Amount to increase stake
    function increaseStakeAmount(address walletAddress, uint256 amount) external onlyOwnerOrManager {
        require(walletAddress != address(0), "Zero addr");
        require(amount > 0, "Invalid amount");
        stakes[walletAddress] += amount;
        totalStaked += amount;
    }
    
    /// Decrease user stake amount
    /// @param walletAddress User wallet address
    /// @param amount Amount to decrease stake
    function decreaseStakeAmount(address walletAddress, uint256 amount) external onlyOwnerOrManager {
        require(walletAddress != address(0), "Zero addr");
        require(amount > 0, "Invalid amount");
        stakes[walletAddress] -= amount;
        totalStaked -= amount;
    }

    /// Increase outstanding vote count
    /// @param walletAddress User wallet address
    /// @param amount Amount to increase outstanding vote count
    function increaseOutstandingVotes(address walletAddress, uint256 amount) external onlyOwnerOrManager {
        require(walletAddress != address(0), "Zero addr");
        require(amount > 0, "Invalid amount");
        outstandingVotes[walletAddress] += amount;
    }

    /// Decrease outstanding vote count
    /// @param walletAddress User wallet address
    /// @param amount Amount to decrease outstanding vote count
    function decreaseOutstandingVotes(address walletAddress, uint256 amount) external onlyOwnerOrManager {
        require(walletAddress != address(0), "Zero addr");
        require(amount > 0, "Invalid amount");
        outstandingVotes[walletAddress] -= amount;
    }

    /// Get outstanding vote count
    /// @param walletAddress User wallet address
    function getOutstandingVotes(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return outstandingVotes[walletAddress];
    }

    /// Increase outstanding vote count for specific dispute contract
    /// @param walletAddress User wallet address
    /// @param dispute Dispute contract address
    /// @param amount Amount to increase dispute vote count
    function increaseDisputeVoteCount(address walletAddress, address dispute, uint256 amount) external onlyOwnerOrManager {
        require(walletAddress != address(0), "Zero addr");
        require(dispute != address(0), "Zero addr");
        require(amount > 0, "Invalid amount");
        disputeVoteCount[dispute][walletAddress] += amount;
    }

    /// Decrease outstanding vote count for specific dispute contract
    /// @param walletAddress User wallet address
    /// @param dispute Dispute contract address
    /// @param amount Amount to decrease dispute vote count
    function decreaseDisputeVoteCount(address walletAddress, address dispute, uint256 amount) external onlyOwnerOrManager {
        require(walletAddress != address(0), "Zero addr");
        require(dispute != address(0), "Zero addr");
        require(amount > 0, "Invalid amount");
        disputeVoteCount[dispute][walletAddress] -= amount;
    }

    /// Get outstanding vote count for specific dispute contract
    /// @param walletAddress User wallet address
    /// @param dispute Dispute contract address
    function getDisputeVoteCount(address walletAddress, address dispute) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        require(dispute != address(0), "Zero addr");
        return disputeVoteCount[dispute][walletAddress];
    }

    /// Increase vote history count
    /// @param walletAddress User wallet address
    /// @param amount Amount to increase vote history count
    function increaseVoteHistoryCount(address walletAddress, uint256 amount) external onlyOwnerOrManager {
        require(walletAddress != address(0), "Zero addr");
        require(amount > 0, "Invalid amount");
        voteHistoryCount[walletAddress] += amount;
    }

    /// Decrease vote history count
    /// @param walletAddress User wallet address
    /// @param amount Amount to decrease vote history count
    function decreaseVoteHistoryCount(address walletAddress, uint256 amount) external onlyOwnerOrManager {
        require(walletAddress != address(0), "Zero addr");
        require(amount > 0, "Invalid amount");
        voteHistoryCount[walletAddress] -= amount;
    }

    /// Get vote history count
    /// @param walletAddress User wallet address
    function getVoteHistoryCount(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return voteHistoryCount[walletAddress];
    }

    /// Add new unstake info entry
    /// @param walletAddress User wallet address
    /// @param amount Amount unstaked
    /// @param timestamp Epoch timestamp of unstake time
    function pushUnstakedInfo(address walletAddress, uint256 amount, uint256 timestamp) external onlyOwnerOrManager {
        require(walletAddress != address(0), "Zero addr");
        require(amount > 0, "Invalid amount");
        require(timestamp > 0, "Invalid time");
        unstakedSLM[walletAddress].push(unstakedInfo({amount: amount, time: timestamp}));
    }

    /// Delete unstake info entry
    /// @param walletAddress User wallet address
    /// @param index Index of unstake
    function deleteUnstakedInfo(address walletAddress, uint256 index) external onlyOwnerOrManager {
        require(walletAddress != address(0), "Zero addr");
        delete unstakedSLM[walletAddress][index];
    }

    /// Update unstake info entry
    /// @param walletAddress User wallet address
    /// @param index Index of unstake
    /// @param amount Amount unstaked
    /// @param timestamp Epoch timestamp of unstake time
    function updateUnstakedInfo(address walletAddress, uint256 index, uint256 amount, uint256 timestamp) external onlyOwnerOrManager {
        require(walletAddress != address(0), "Zero addr");
        require(amount > 0, "Invalid amount");
        require(timestamp > 0, "Invalid time");
        unstakedSLM[walletAddress][index] = unstakedInfo({amount: amount, time: timestamp});
    }

    /// Get unstaked amount for specific unstake entry
    /// @param walletAddress User wallet address
    /// @param index Index of unstake
    function getUnstakedAmount(address walletAddress, uint256 index) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return unstakedSLM[walletAddress][index].amount;
    }

    /// Get unstaked timestamp for specific unstake entry
    /// @param walletAddress User wallet address
    /// @param index Index of unstake
    function getUnstakedTime(address walletAddress, uint256 index) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return unstakedSLM[walletAddress][index].time;
    }

    /// Get unstake count for a user wallet address
    /// @param walletAddress User wallet address
    function getUnstakeCount(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return unstakedSLM[walletAddress].length;
    }

    /// Get total unstaked SLM for a user wallet address
    /// @param walletAddress User wallet address
    function getUnstakedSLM(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        uint256 currentUnstakedSLM = 0;
        for (uint256 i = 0; i < unstakedSLM[walletAddress].length; i += 1) {
            currentUnstakedSLM += unstakedSLM[walletAddress][i].amount;
        }
        return currentUnstakedSLM;
    }

    /// Set dispute vote end timestamp
    /// @param dispute Dispute contract address
    /// @param voteEndTimestamp Dispute vote end epoch timestamp
    function setVoteEndTime(address dispute, uint256 voteEndTimestamp) external onlyOwnerOrManager {
        require(dispute != address(0), "Zero addr");
        require(voteEndTimestamp > 0, "Invalid timestamp");
        voteEndTimes[dispute] = voteEndTimestamp;
    }

    /// Get vote end timestamp of dispute contract
    /// @param dispute Dispute contract address
    function getVoteEndTime(address dispute) external view returns(uint256) {
        require(dispute != address(0), "Zero addr");
        return voteEndTimes[dispute];
    }

    /// Send funds to user wallet address
    /// @param walletAddress User wallet address
    /// @param amount Amount to send to user
    function sendFunds(address walletAddress, uint256 amount) external onlyOwnerOrManager {
        require(walletAddress != address(0), "Zero addr");
        require(amount > 0, "Invalid amount");
        token.transfer(walletAddress, amount);
    }

    /// Announce reward payment information
    /// @param rewardPercent Reward payment percentage in whole numbers
    /// @param rewardAmount Amount of reward payment
    function announceReward(uint8 rewardPercent, uint256 rewardAmount) external onlyOwnerOrManager {
        require(rewardPercent > 0, "Invalid percent");
        require(rewardAmount > 0, "Invalid amount");
        rewardPercentHistory.push(rewardPercent);
        rewardAmountHistory.push(rewardAmount);
    }

    /// Get latest reward withdrawn by user wallet address
    /// @param walletAddress User wallet address
    function getLastRewardIndex(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return stakerLastRewardIndex[walletAddress];
    }

    /// Set latest reward index withdrawn by user wallet address
    /// @param walletAddress User wallet address
    /// @param index Reward index
    function setLastRewardIndex(address walletAddress, uint256 index) external onlyOwnerOrManager {
        require(walletAddress != address(0), "Zero addr");
        stakerLastRewardIndex[walletAddress] = index;
    }

    /// Get latest reward withdrawal timestamp
    /// @param walletAddress User wallet address
    function getLastWithdrawalTime(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return stakerLastWithdrawalTime[walletAddress];
    }

    /// Set latest reward withdrawal timestamp
    /// @param walletAddress User wallet address
    /// @param timestamp Epoch timestamp of latest withdrawal
    function setLastWithdrawalTime(address walletAddress, uint256 timestamp) external onlyOwnerOrManager {
        require(walletAddress != address(0), "Zero addr");
        stakerLastWithdrawalTime[walletAddress] = timestamp;
    }

    /// Get reward percent of a certain reward payment
    /// @param index Index of reward payment
    function getRewardPercentHistory(uint256 index) external view returns(uint256) {
        return rewardPercentHistory[index];
    }

    /// Get total number of reward percentages
    function getRewardPercentHistoryLength() external view returns(uint256) {
        return rewardPercentHistory.length;
    }

    /// Get reward amount of a certain reward payment
    /// @param index Index of reward payment
    function getRewardAmountHistory(uint256 index) external view returns(uint256) {
        return rewardAmountHistory[index];
    }

    /// Get total number of reward amounts
    function getRewardAmountHistoryLength() external view returns(uint256) {
        return rewardPercentHistory.length;
    }

}
