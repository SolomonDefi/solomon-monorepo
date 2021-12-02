// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./library/Ownable.sol";
import "./library/IERC20.sol";
import "./SlmStakerManager.sol";

// TODO: Add back interest/reward sections
// TODO: Update references to SLM Token

/// @title SlmStakerStorage stores information related to the Stakers
contract SlmStakerStorage is Ownable {
    address public stakerManager;

    IERC20 public token;

    uint256 public minStake;

    uint256 public unstakePeriod;

    uint256 public totalStaked;

    uint256 public minWithdrawalWaitTime;

    /// Mapping of wallet address to datestamp of last withdrawal
    mapping(address => uint256) public stakerLastWithdrawalTime;

    /// Mapping of wallet address to latest reward index withdrawn
    mapping(address => uint256) public stakerLastRewardIndex;

    /// Mapping of StakerManager address to staker pool
    mapping(address => uint256[]) public stakerPool;

    /// Mapping of wallet address to user ID
    mapping(address => uint256) public userIdList;

    /// Mapping to get wallet address from user ID
    mapping(uint256 => address) public addressLookup;

    /// Mapping for User wallet address to User ID and stake amount
    mapping(address => uint256) public stakes;

    /// Mapping for User wallet address to User ID and unstake history
    mapping(address => unstakedInfo[]) public unstakedSLM;

    /// User address to outstanding votes a staker must submit
    mapping(address => uint256) public outstandingVotes;

    /// Dispute Address to Staker votes a staker has outstanding
    mapping(address => mapping(address => uint256)) public disputeVoteCount;

    /// Dispute Address to Staker previous number of vote requirements
    mapping(address => uint256) public voteHistoryCount;

    /// Timestamp in seconds for voting end times for all disputes
    mapping(address => uint256) public voteEndTimes;

    /// History of reward percentages
    uint256[] public rewardPercentHistory;

    /// History of reward Amounts
    uint256[] public rewardAmountHistory;

    struct unstakedInfo {
        uint256 amount;
        uint256 time;
    }

    modifier onlyOwnerOrManager() {
        require(msg.sender == owner || msg.sender == stakerManager, "Unauthorized access");
        _;
    }

    modifier onlyManager() {
        require(msg.sender == stakerManager, "Unauthorized access");
        _;
    }

    constructor(address tokenAddress, uint256 initialUnstakePeriod, uint256 minimumStake) {
        require(tokenAddress != address(0), "Zero addr");
        require(initialUnstakePeriod > 0, "Invalid unstake period");
        require(minimumStake > 0, "Invalid minimum stake");
        token = IERC20(tokenAddress);
        unstakePeriod = initialUnstakePeriod;
        minStake = minimumStake;
    }

    function setStakerManager(address newStakerManager) external onlyOwner {
        require(newStakerManager != address(0), "Zero addr");
        stakerManager = newStakerManager;
    }

    function setMinStake(uint256 newMinStake) external onlyOwnerOrManager {
        require(newMinStake > 0, "Invalid minimum stake");
        minStake = newMinStake;
    }

    function setUnstakePeriod(uint256 periodDays) external onlyOwnerOrManager {
        require(periodDays > 0, "Invalid days");
        unstakePeriod = periodDays;
    }

    function setMinWithdrawalWaitTime(uint256 newWaitTime) external onlyOwner {
        require(newWaitTime >= 0, "Invalid wait time");
        minWithdrawalWaitTime = newWaitTime;
    }

    function setUserId(address walletAddress, uint256 userId) external onlyOwnerOrManager {
        require(walletAddress != address(0), "Zero addr");
        require(userId > 0, "Invalid user ID");
        userIdList[walletAddress] = userId;
        addressLookup[userId] = walletAddress;
    }

    function getUserId(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return userIdList[walletAddress];
    }

    function getUserAddress(uint256 userId) external view returns(address) {
        return addressLookup[userId];
    }

    function updateStakerPool(uint256[] memory newStakerPool) external onlyOwnerOrManager {
        require(newStakerPool.length > 0, "Invalid staker pool");
        stakerPool[address(stakerManager)] = newStakerPool;
    }

    function getStakerPool(address managerAddress) external view returns(uint256[] memory) {
        if (managerAddress == address(0)) {
            return stakerPool[stakerManager];
        }
        return stakerPool[managerAddress];
    }

    function getStake(address user) external view returns(uint256) {
        require(user != address(0), "Zero addr");
        return stakes[user];
    }

    function increaseStakeAmount(address user, uint256 amount) external onlyOwnerOrManager {
        require(user != address(0), "Zero addr");
        require(amount > 0, "Invalid amount");
        stakes[user] += amount;
        totalStaked += amount;
    }

    function decreaseStakeAmount(address user, uint256 amount) external onlyOwnerOrManager {
        require(user != address(0), "Zero addr");
        require(amount > 0, "Invalid amount");
        stakes[user] -= amount;
        totalStaked -= amount;
    }

    function increaseOutstandingVotes(address user, uint256 amount) external onlyOwnerOrManager {
        require(amount > 0, "Invalid amount");
        require(user != address(0), "Zero addr");
        outstandingVotes[user] += amount;
    }

    function decreaseOutstandingVotes(address user, uint256 amount) external onlyOwnerOrManager {
        require(amount > 0, "Invalid amount");
        require(user != address(0), "Zero addr");
        outstandingVotes[user] -= amount;
    }

    function getOutstandingVotes(address user) external view returns(uint256) {
        require(user != address(0), "Zero addr");
        return outstandingVotes[user];
    }

    function increaseDisputeVoteCount(address user, address dispute, uint256 amount) external onlyOwnerOrManager {
        require(amount > 0, "Invalid amount");
        require(dispute != address(0), "Zero addr");
        require(user != address(0), "Zero addr");
        disputeVoteCount[dispute][user] += amount;
    }

    function decreaseDisputeVoteCount(address user, address dispute, uint256 amount) external onlyOwnerOrManager {
        require(amount > 0, "Invalid amount");
        require(dispute != address(0), "Zero addr");
        require(user != address(0), "Zero addr");
        disputeVoteCount[dispute][user] -= amount;
    }

    function getDisputeVoteCount(address user, address dispute) external view returns(uint256) {
        require(dispute != address(0), "Zero addr");
        require(user != address(0), "Zero addr");
        return disputeVoteCount[dispute][user];
    }

    function increaseVoteHistoryCount(address user, uint256 amount) external onlyOwnerOrManager {
        require(amount > 0, "Invalid amount");
        require(user != address(0), "Zero addr");
        voteHistoryCount[user] += amount;
    }

    function decreaseVoteHistoryCount(address user, uint256 amount) external onlyOwnerOrManager {
        require(amount > 0, "Invalid amount");
        require(user != address(0), "Zero addr");
        voteHistoryCount[user] -= amount;
    }

    function getVoteHistoryCount(address user) external view returns(uint256) {
        require(user != address(0), "Zero addr");
        return voteHistoryCount[user];
    }

    function pushUnstakedInfo(address user, uint256 amount, uint256 timestamp) external onlyOwnerOrManager {
        require(user != address(0), "Zero addr");
        require(timestamp > 0, "Invalid time");
        unstakedSLM[user].push(unstakedInfo({amount: amount, time: timestamp}));
    }

    function deleteUnstakedInfo(address user, uint256 index) external onlyOwnerOrManager {
        require(user != address(0), "Zero addr");
        delete unstakedSLM[user][index];
    }

    function updateUnstakedInfo(address user, uint256 index, uint256 amount, uint256 timestamp) external onlyOwnerOrManager {
        require(user != address(0), "Zero addr");
        require(timestamp > 0, "Invalid time");
        unstakedSLM[user][index] = unstakedInfo({amount: amount, time: timestamp});
    }

    function getUnstakedAmount(address user, uint256 index) external view returns(uint256) {
        require(user != address(0), "Zero addr");
        return unstakedSLM[user][index].amount;
    }

    function getUnstakedTime(address user, uint256 index) external view returns(uint256) {
        require(user != address(0), "Zero addr");
        return unstakedSLM[user][index].time;
    }

    function getUnstakeCount(address user) external view returns(uint256) {
        require(user != address(0), "Zero addr");
        return unstakedSLM[user].length;
    }

    function getUnstakedSLM(address user) external view returns(uint256) {
        require(user != address(0), "Zero addr");
        uint256 currentUnstakedSLM = 0;
        for (uint256 i = 0; i < unstakedSLM[user].length; i += 1) {
            currentUnstakedSLM += unstakedSLM[user][i].amount;
        }
        return currentUnstakedSLM;
    }

    function setVoteEndTime(address dispute, uint256 voteEndTimestamp) external onlyOwnerOrManager {
        require(dispute != address(0), "Zero addr");
        require(voteEndTimestamp > 0, "Invalid timestamp");
        voteEndTimes[dispute] = voteEndTimestamp;
    }

    function getVoteEndTime(address dispute) external view returns(uint256) {
        require(dispute != address(0), "Zero addr");
        return voteEndTimes[dispute];
    }

    function sendFunds(address walletAddress, uint256 amount) external onlyOwnerOrManager {
        require(walletAddress != address(0), "Zero addr");
        require(amount > 0, "Invalid amount");
        token.transfer(walletAddress, amount);
    }

    function announceReward(uint32 rewardPercent, uint256 rewardAmount) external onlyOwnerOrManager {
        require(rewardPercent > 0, "Invalid percent");
        require(rewardAmount > 0, "Invalid amount");
        rewardPercentHistory.push(rewardPercent);
        rewardAmountHistory.push(rewardAmount);
    }

    function getLastRewardIndex(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return stakerLastRewardIndex[walletAddress];
    }

    function setLastRewardIndex(address walletAddress, uint256 index) external onlyOwnerOrManager {
        require(walletAddress != address(0), "Zero addr");
        stakerLastRewardIndex[walletAddress] = index;
    }

    function getLastWithdrawalTime(address walletAddress) external view returns(uint256) {
        require(walletAddress != address(0), "Zero addr");
        return stakerLastWithdrawalTime[walletAddress];
    }

    function setLastWithdrawalTime(address walletAddress, uint256 timestamp) external onlyOwnerOrManager {
        require(walletAddress != address(0), "Zero addr");
        stakerLastWithdrawalTime[walletAddress] = timestamp;
    }

    function getRewardPercentHistory(uint256 index) external view returns(uint256) {
        return rewardPercentHistory[index];
    }

    function getRewardPercentHistoryLength() external view returns(uint256) {
        return rewardPercentHistory.length;
    }

    function getRewardAmountHistory(uint256 index) external view returns(uint256) {
        return rewardAmountHistory[index];
    }

    function getRewardAmountHistoryLength() external view returns(uint256) {
        return rewardPercentHistory.length;
    }

}
