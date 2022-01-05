// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.9;

import "./Ownable.sol";
import "./IERC20.sol";
import "../SlmStakerManager.sol";

/// @title Solomon Judgement
/// @author Solomon DeFi
/// @notice Functionality for voting on chargeback/escrow events
contract SlmJudgement is Ownable {

    /// Event announcing the initialization of dispute
    /// @param slmContract Dispute contract address
    /// @param endTime End time for dispute
    event DisputeInitialized(address slmContract, uint256 endTime);

    /// Event declaring the result of the dispute vote
    /// @param slmContract Dispute contract address
    /// @param result Final state of dispute
    event VoteResult(address slmContract, VoteStates result);

    /// @dev List of VoteStates a dispute can have
    enum VoteStates {
        Inactive,
        InsufficientVotes,
        BuyerWins,
        MerchantWins,
        Tie
    }

    /// @dev VoteState object
    VoteStates public states;

    /// @dev SlmStakerManager object
    SlmStakerManager public stakerManager;

    /// @dev Minimum number of jurors required to start a dispute vote
    uint8 public minJurorCount;

    /// @dev Full list of stakers
    uint256[] private stakerPool;

    /// List of dispute to latest vote states
    mapping(address => VoteStates) private voteResults;

    /// Record of dispute contracts to dispute vote details
    mapping(address => Dispute) private disputes;

    /// List of user addresses to member role details
    mapping(address => Role) private disputeRoles;

    /// Map of available voters
    mapping(address => bool) private voters;

    /// Mapping of dispute address to staker address and juror status
    mapping(address => mapping(address => bool)) private jurorList;

    /// Mapping of dispute address to latest index for Round Robin Mapping
    mapping(address => uint32) private jurorSelectionIndex;

    /// Mapping to mark dispute as inactive
    mapping(address => bool) public inactiveDispute;

    /// @dev Restrict access to the owner or SlmStakerManager
    modifier onlyOwnerOrManager() {
        require(msg.sender == owner || msg.sender == address(stakerManager), "Unauthorized access");
        _;
    }

    /// @dev Structure outlining dispute information
    struct Dispute {
        // Chargeback/escrow votes
        //  0 == No vote
        //  1 == Vote in favor of buyer
        //  2 == Vote in favor of merchant
        mapping(address => uint8) votes;
        // Number of votes in favor of merchant
        uint8 merchantVoteCount;
        // Number of votes in favor of buyer
        uint8 buyerVoteCount;
        // Required votes for decision
        uint8 quorum;
        // Voting end time
        uint256 voteEndTime;
    }

    /// @dev List of roles that users can have
    enum MemberRole {
        Inactive,
        Merchant,
        Buyer,
        Juror
    }

    /// @dev Structure storing merchant roles for each user and secret keys for each user
    struct Role {
        // Member role
        //  1 == Merchant
        //  2 == Buyer
        //  3 == Juror
        mapping(address => MemberRole) memberRoles;
        mapping(address => bytes32) encryptedKeyList;
    }

    /// Initialize contract and set default values
    /// @param newStakerManager SlmStakerManager address
    /// @param newMinJurorCount Minimum juror count to start a dispute vote
    constructor(address newStakerManager, uint8 newMinJurorCount) {
        require(newStakerManager != address(0), "Zero addr");
        require(newMinJurorCount > 0, "Invalid juror count");
        stakerManager = SlmStakerManager(newStakerManager);
        minJurorCount = newMinJurorCount;
    }

    /// Sets address of SlmStakerManager
    /// @param newStakerManager SlmStakerManager address
    function setStakerManager(address newStakerManager) external onlyOwner {
        require(newStakerManager != address(0), "Zero addr");
        stakerManager = SlmStakerManager(newStakerManager);
    }

    /// Sets minimum juror count
    /// @param newMinJurorCount Minimum juror count to start a dispute vote
    function setMinJurorCount(uint8 newMinJurorCount) external onlyOwner {
        require(newMinJurorCount >= 3, "Invalid juror count");
        minJurorCount = newMinJurorCount;
    }

    /// Initialize dispute and sets all voting parameters
    /// @param slmContract Dispute contract address
    /// @param quorum Required number of submitted votes to come to a resolution
    /// @param endTime End time of dispute vote
    function initializeDispute(address slmContract, uint8 quorum, uint256 endTime) external onlyOwner {
        require(slmContract != address(0), "Zero addr");
        require(quorum > 0, "Invalid quorum");
        require(endTime > 0, "Invalid endTime");
        _setJurors(slmContract);
        disputes[slmContract].quorum = quorum;
        disputes[slmContract].voteEndTime = endTime;
        stakerManager.setVoteDetails(slmContract, endTime);

        emit DisputeInitialized(slmContract, endTime);
        inactiveDispute[slmContract] = false;
    }

    /// Set access controls by user to the dispute contract
    /// @param slmContract Dispute contract address
    /// @param roles Array containing role of each user
    /// @param addressList Array containing address of each user
    /// @param keyList Array containing secret key of each user
    function setDisputeAccess(address slmContract, MemberRole[] memory roles, address[] memory addressList, bytes32[] memory keyList) external onlyOwner {
        require(slmContract != address(0), "Zero addr");
        require(roles.length > 0, "Empty array");
        require(addressList.length == keyList.length && keyList.length == roles.length, "Invalid array length");
        Role storage disputeRole = disputeRoles[slmContract];
        for (uint8 i = 0; i < roles.length; i++) {
            disputeRole.memberRoles[addressList[i]] = roles[i];
            disputeRole.encryptedKeyList[addressList[i]] = keyList[i];
        }
    }

    /// All user to submit encrypted dispute vote
    /// @param slmContract Dispute contract address
    /// @param encryptedVote User submitted encrypted vote
    function vote(address slmContract, bytes32 encryptedVote) external {
        require(slmContract != address(0), "Zero addr");
        require(disputes[slmContract].voteEndTime > block.timestamp, "Voting has ended");
        Role storage roles = disputeRoles[slmContract];
        require(roles.memberRoles[msg.sender] == MemberRole.Juror, "Voter ineligible");
        // Check that encryptedVote matches the encryptedKey stored on chain
        if (roles.encryptedKeyList[msg.sender] == encryptedVote) {
            if (disputes[slmContract].votes[msg.sender] == 0) {
                // If hasn't voted yet, increase buyerVoteCount by 1
                disputes[slmContract].buyerVoteCount += 1;
            } else if (disputes[slmContract].votes[msg.sender] == 2) {
                // Adjusts vote count if user changes vote from a vote for the merchant
                disputes[slmContract].merchantVoteCount -= 1;
                disputes[slmContract].buyerVoteCount += 1;
            }
            // Log user's vote for the buyer
            disputes[slmContract].votes[msg.sender] = 1;
        // If encryptedVote doesn't match, defaults to a vote for the merchant
        } else {
            if (disputes[slmContract].votes[msg.sender] == 0) {
                // If hasn't voted yet, increase merchantVoteCount by 1
                disputes[slmContract].merchantVoteCount += 1;
            } else if (disputes[slmContract].votes[msg.sender] == 1) {
                // Adjusts vote count if user changes vote from a vote for the buyer
                disputes[slmContract].buyerVoteCount -= 1;
                disputes[slmContract].merchantVoteCount += 1;
            }
            // Log user's vote for the merchant
            disputes[slmContract].votes[msg.sender] = 2;
        }
        stakerManager.managedVote(msg.sender, slmContract);
    }

    /// Tallies votes and returns the latest state of a contract dispute
    /// @param slmContract Contract to check dispute status
    function voteStatus(address slmContract) public {
        require(slmContract != address(0), "Zero addr");
        require(!inactiveDispute[slmContract], "Dispute resolved");
        Dispute storage dispute = disputes[slmContract];
        uint16 merchantVotes = dispute.merchantVoteCount;
        uint16 buyerVotes = dispute.buyerVoteCount;
        // No vote exists
        if (dispute.quorum == 0) {
            voteResults[slmContract] = VoteStates.Inactive;
        // Vote not complete
        } else if (merchantVotes + buyerVotes < dispute.quorum) {
            voteResults[slmContract] = VoteStates.InsufficientVotes;
        } else if (buyerVotes > merchantVotes) {
            voteResults[slmContract] = VoteStates.BuyerWins;
        } else if (merchantVotes > buyerVotes) {
            voteResults[slmContract] = VoteStates.MerchantWins;
        // Tie
        } else {
            voteResults[slmContract] = VoteStates.Tie;
        }

        if (dispute.voteEndTime < block.timestamp &&
            !inactiveDispute[slmContract] &&
            voteResults[slmContract] > VoteStates.InsufficientVotes
        ) {
            inactiveDispute[slmContract] = true;
            emit VoteResult(slmContract, voteResults[slmContract]);
        }
    }

    /// Check that user is authorized to access dispute
    /// @param slmContract Dispute contract address
    /// @param user User wallet address
    /// @param encryptionKey User secret key for authentication purposes
    function authorizeUser(address slmContract, address user, bytes32 encryptionKey) external view {
        require(slmContract != address(0), "Zero addr");
        require(user != address(0), "Zero addr");
        Role storage roles = disputeRoles[slmContract];
        require(roles.encryptedKeyList[user] == keccak256(abi.encodePacked(user, encryptionKey)), "Unauthorized access");
    }

    /// Gets latest vote result
    /// @param slmContract Dispute contract address
    /// @param encryptionKey User secret key for authentication purposes
    function getVoteResults(address slmContract, bytes32 encryptionKey) external view returns(VoteStates) {
        require(slmContract != address(0), "Zero addr");
        Dispute storage dispute = disputes[slmContract];
        Role storage roles = disputeRoles[slmContract];
        if (dispute.voteEndTime > block.timestamp) {
            require(roles.memberRoles[msg.sender] == MemberRole.Merchant || roles.memberRoles[msg.sender] == MemberRole.Buyer, "Unauthorized role");
            this.authorizeUser(slmContract, msg.sender, encryptionKey);
            return voteResults[slmContract];
        }
        return voteResults[slmContract];
    }

    /// Gets and sets staker pool from SlmStakerManager
    function setStakerPool() external onlyOwner {
        stakerPool = stakerManager.getStakerPool();
    }

    /// Check if a staker is a juror for dispute
    /// @param slmContract Dispute contract address
    /// @param walletAddress User wallet address
    function checkJuror(address slmContract, address walletAddress) external onlyOwnerOrManager view returns(bool) {
        require(slmContract != address(0), "Zero addr");
        require(walletAddress != address(0), "Zero addr");
        return jurorList[slmContract][walletAddress];
    }

    /// Juror selection from staker pool
    /// @param slmContract Dispute contract address
    function _setJurors(address slmContract) private {
        require(slmContract != address(0), "Zero addr");

        uint256 stakerCount = stakerPool.length;
        require(stakerCount >= minJurorCount, "Not enough stakers");

        uint32 selectedStartCount = 0;
        if (jurorSelectionIndex[slmContract] > 0) {
            selectedStartCount = jurorSelectionIndex[slmContract];
        }

        for (uint8 i = 0; i < minJurorCount; i++) {
            uint256 userId = stakerPool[selectedStartCount];
            address userAddress = stakerManager.getUserAddress(userId);
            jurorList[slmContract][userAddress] = true;
            stakerManager.updateOutstandingVotes(userAddress, slmContract);

            selectedStartCount += 1;
            if (selectedStartCount == stakerCount) {
                selectedStartCount = 0;
            }

            jurorSelectionIndex[slmContract] = selectedStartCount;
        }

    }
}
