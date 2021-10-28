// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./library/Ownable.sol";
import "./library/IERC20.sol";
import "./SlmStakerManager.sol";

// TODO: Add back interest/reward sections
// TODO: Update references to SLM Token

/// @title SlmStakerStorage stores information related to the Stakers
contract SlmStakerStorage is Ownable {
    address stakerManager;

    IERC20 public token;

    uint256 minStake;

    uint256 public unstakePeriod;

    /// Mapping of StakerManager address to staker pool
    mapping(address => uint256[]) public stakerPool;

    /// Mapping of wallet address to user ID
    mapping(address => uint256) public userIdList;

    /// Mapping to get wallet address from user ID
    mapping(uint256 => address) public addressLookup;

    /// Mapping for User wallet address to User ID and stake amount
    mapping(address => mapping(uint256 => uint256)) public stakes;

    /// Mapping for User wallet address to User ID and unstake history
    mapping(address => mapping(uint256 => unstakedInfo[])) public unstakedSLM;

    /// User address to outstanding votes a staker must submit
    mapping(address => mapping(uint256 => uint256)) public outstandingVotes;

    /// Dispute Address to Staker votes a staker has outstanding
    mapping(address => mapping(uint256 => uint256)) public disputeVoteCount;

    /// Dispute Address to Staker previous number of vote requirements
    mapping(address => mapping(uint256 => uint256)) public voteHistoryCount;

    /// Timestamp in seconds for voting end times for all disputes
    mapping(address => uint256) public voteEndTimes;

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

    function updateStakerPool(uint256[] memory newStakerPool) external onlyManager {
        require(newStakerPool.length > 0, "Invalid staker pool");
        stakerPool[msg.sender] = newStakerPool;
    }

    function getStakerPool(address managerAddress) external view returns(uint256[] memory) {
        if(managerAddress == address(0)) {
            return stakerPool[stakerManager];
        }
        return stakerPool[managerAddress];
    }

    function getStake(address user, uint256 beneficiary) external view returns(uint256) {
        require(user != address(0), "Zero addr");
        require(beneficiary > 0, "Invalid account");
        return stakes[user][beneficiary];
    }

    function increaseStakeAmount(address user, uint256 beneficiary, uint256 amount) external onlyOwnerOrManager {
        require(user != address(0), "Zero addr");
        require(beneficiary > 0, "Invalid account");
        require(amount > 0, "Invalid amount");
        stakes[user][beneficiary] += amount;
    }

    function decreaseStakeAmount(address user, uint256 beneficiary, uint256 amount) external onlyOwnerOrManager {
        require(user != address(0), "Zero addr");
        require(beneficiary > 0, "Invalid account");
        require(amount > 0, "Invalid amount");
        stakes[user][beneficiary] -= amount;
    }

    function increaseOutstandingVotes(uint256 amount, address user, uint256 beneficiary) external onlyOwnerOrManager {
        require(amount > 0, "Invalid amount");
        require(user != address(0), "Zero addr");
        require(beneficiary > 0, "Invalid account");
        outstandingVotes[user][beneficiary] += amount;
    }

    function decreaseOutstandingVotes(uint256 amount, address user, uint256 beneficiary) external onlyOwnerOrManager {
        require(amount > 0, "Invalid amount");
        require(user != address(0), "Zero addr");
        require(beneficiary > 0, "Invalid account");
        outstandingVotes[user][beneficiary] -= amount;
    }

    function getOutstandingVotes(address user, uint256 beneficiary) external view returns(uint256) {
        require(user != address(0), "Zero addr");
        require(beneficiary > 0, "Invalid account");
        return outstandingVotes[user][beneficiary];
    }

    function increaseDisputeVoteCount(uint256 amount, address dispute, uint256 beneficiary) external onlyOwnerOrManager {
        require(amount > 0, "Invalid amount");
        require(dispute != address(0), "Zero addr");
        require(beneficiary > 0, "Invalid account");
        disputeVoteCount[dispute][beneficiary] += amount;
    }

    function decreaseDisputeVoteCount(uint256 amount, address dispute, uint256 beneficiary) external onlyOwnerOrManager {
        require(amount > 0, "Invalid amount");
        require(dispute != address(0), "Zero addr");
        require(beneficiary > 0, "Invalid account");
        disputeVoteCount[dispute][beneficiary] -= amount;
    }

    function getDisputeVoteCount(address dispute, uint256 beneficiary) external view returns(uint256) {
        require(dispute != address(0), "Zero addr");
        require(beneficiary > 0, "Invalid account");
        return disputeVoteCount[dispute][beneficiary];
    }

    function increaseVoteHistoryCount(uint256 amount, address user, uint256 beneficiary) external onlyOwnerOrManager {
        require(amount > 0, "Invalid amount");
        require(user != address(0), "Zero addr");
        require(beneficiary > 0, "Invalid account");
        voteHistoryCount[user][beneficiary] += amount;
    }

    function decreaseVoteHistoryCount(uint256 amount, address user, uint256 beneficiary) external onlyOwnerOrManager {
        require(amount > 0, "Invalid amount");
        require(user != address(0), "Zero addr");
        require(beneficiary > 0, "Invalid account");
        voteHistoryCount[user][beneficiary] -= amount;
    }

    function getVoteHistoryCount(address user, uint256 beneficiary) external view returns(uint256) {
        require(user != address(0), "Zero addr");
        require(beneficiary > 0, "Invalid account");
        return voteHistoryCount[user][beneficiary];
    }

    function pushUnstakedInfo(address user, uint256 beneficiary, uint256 amount, uint256 timestamp) external onlyOwnerOrManager {
        require(user != address(0), "Zero addr");
        require(beneficiary > 0, "Invalid account");
        require(timestamp > 0, "Invalid time");
        unstakedSLM[user][beneficiary].push(unstakedInfo({amount: amount, time: timestamp}));
    }

    function deleteUnstakedInfo(address user, uint256 beneficiary, uint256 index) external onlyOwnerOrManager {
        require(user != address(0), "Zero addr");
        require(beneficiary > 0, "Invalid account");
        delete unstakedSLM[user][beneficiary][index];
    }

    function updateUnstakedInfo(address user, uint256 beneficiary, uint256 index, uint256 amount, uint256 timestamp) external onlyOwnerOrManager {
        require(user != address(0), "Zero addr");
        require(beneficiary > 0, "Invalid account");
        require(timestamp > 0, "Invalid time");
        unstakedSLM[user][beneficiary][index] = unstakedInfo({amount: amount, time: timestamp});
    }

    function getUnstakedAmount(address user, uint256 beneficiary, uint256 index) external view returns(uint256) {
        require(user != address(0), "Zero addr");
        require(beneficiary > 0, "Invalid account");
        return unstakedSLM[user][beneficiary][index].amount;
    }

    function getUnstakedTime(address user, uint256 beneficiary, uint256 index) external view returns(uint256) {
        require(user != address(0), "Zero addr");
        require(beneficiary > 0, "Invalid account");
        return unstakedSLM[user][beneficiary][index].time;
    }

    function getUnstakeCount(address user, uint256 beneficiary) external view returns(uint256) {
        require(user != address(0), "Zero addr");
        require(beneficiary > 0, "Invalid account");
        return unstakedSLM[user][beneficiary].length;
    }

    function getUnstakedSLM(address user, uint256 beneficiary) external view returns(uint256) {
        require(user != address(0), "Zero addr");
        require(beneficiary > 0, "Invalid account");
        uint256 currentUnstakedSLM = 0;
        for(uint256 i = 0; i < unstakedSLM[user][beneficiary].length; i += 1) {
            currentUnstakedSLM += unstakedSLM[user][beneficiary][i].amount;
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

    function sendFunds(address user, uint256 amount) external onlyOwnerOrManager {
        require(user != address(0), "Zero addr");
        require(amount > 0, "Invalid amount");
        token.transfer(user, amount);
    }

}
