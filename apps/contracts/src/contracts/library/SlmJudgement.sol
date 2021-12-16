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
    uint16 public minJurorCount;

    /// @dev Array to store selected jurors during selection process
    uint256[] private selectedJurors;

    /// @dev Full list of stakers
    uint256[] public stakerPool;

    /// @dev Flag to mark dispute as inactive
    bool inactiveDispute = false;

    /// List of addresses and active flag to indicate latest active admins
    mapping(address => bool) public adminList;

    /// List of dispute to latest vote states
    mapping(address => VoteStates) public voteResults;

    /// Record of dispute contracts to dispute vote details
    mapping(address => Dispute) public disputes;

    /// List of user addresses to member role details
    mapping(address => Role) private disputeRoles;

    /// Map of available voters
    mapping(address => bool) public voters;

    /// List of juror list per dispute address
    mapping(address => uint256[]) public jurorList;

    /// Mapping of dispute address to latest index for Round Robin Mapping
    mapping(address => uint32) public jurorSelectionIndex;

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
        uint16 merchantVoteCount;
        // Number of votes in favor of buyer
        uint16 buyerVoteCount;
        // Required votes for decision
        uint16 quorum;
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
    constructor(address newStakerManager, uint16 newMinJurorCount) {
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
    function setMinJurorCount(uint16 newMinJurorCount) external onlyOwner {
        require(newMinJurorCount >= 3, "Invalid juror count");
        minJurorCount = newMinJurorCount;
    }

    /// Initialize dispute and sets all voting parameters
    /// @param slmContract Dispute contract address
    /// @param quorum Required number of submitted votes to come to a resolution
    /// @param endTime End time of dispute vote
    function initializeDispute(address slmContract, uint16 quorum, uint256 endTime) external onlyOwner {
        require(slmContract != address(0), "Zero addr");
        require(quorum > 0, "Invalid quorum");
        require(endTime > 0, "Invalid endTime");
        _setJurors(slmContract);
        disputes[slmContract].quorum = quorum;
        disputes[slmContract].voteEndTime = endTime;
        stakerManager.setVoteDetails(slmContract, endTime);
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
        for (uint32 i = 0; i < roles.length; i++) {
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
        if (roles.encryptedKeyList[msg.sender] == encryptedVote) {
            if (disputes[slmContract].votes[msg.sender] == 0) {
                disputes[slmContract].buyerVoteCount += 1;
            } else if (disputes[slmContract].votes[msg.sender] == 2) {
                disputes[slmContract].merchantVoteCount -= 1;
                disputes[slmContract].buyerVoteCount += 1;
            }
            disputes[slmContract].votes[msg.sender] = 1;
        } else {
            if (disputes[slmContract].votes[msg.sender] == 0) {
                disputes[slmContract].merchantVoteCount += 1;
            } else if (disputes[slmContract].votes[msg.sender] == 1) {
                disputes[slmContract].buyerVoteCount -= 1;
                disputes[slmContract].merchantVoteCount += 1;
            }
            disputes[slmContract].votes[msg.sender] = 2;
        }
        stakerManager.managedVote(msg.sender, slmContract);
    }

    /// Tallies votes and returns the latest state of a contract dispute
    /// @param slmContract Contract to check dispute status
    function voteStatus(address slmContract) public {
        require(slmContract != address(0), "Zero addr");
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

    /// @dev Sets list of jurors
    /// @param slmContract Dispute contract address
    function _setJurors(address slmContract) private {
        require(slmContract != address(0), "Zero addr");
        jurorList[slmContract] = _selectJurorList(slmContract);
    }

    /// Gets jurors for a specific dispute
    /// @param slmContract Dispute contract address
    function getJurors(address slmContract) external onlyOwnerOrManager view returns(uint256[] memory) {
        require(slmContract != address(0), "Zero addr");
        return jurorList[slmContract];
    }

    /// Juror selection from staker pool
    /// @param slmContract Dispute contract address
    function _selectJurorList(address slmContract) private returns(uint256[] memory) {
        require(slmContract != address(0), "Zero addr");
        Role storage roles = disputeRoles[slmContract];
        // TODO -- Find better alternative to round robin selection
        uint256 stakerCount = stakerPool.length;
        require(stakerCount >= minJurorCount, "Not enough stakers");

        uint32 selectedStartCount;
        if (jurorSelectionIndex[slmContract] > 0) {
            selectedStartCount = jurorSelectionIndex[slmContract];
        } else {
            selectedStartCount = 0;
        }
        address userAddress;

        uint32 i = 0;

        while (i < minJurorCount) {
            selectedJurors.push(stakerPool[selectedStartCount]);

            userAddress = stakerManager.getUserAddress(selectedJurors[i]);
            roles.memberRoles[userAddress] = MemberRole.Juror;

            i += 1;
            selectedStartCount += 1;

            if (selectedStartCount == stakerCount) {
                selectedStartCount = 0;
            }

            jurorSelectionIndex[slmContract] = selectedStartCount;
        }

        return selectedJurors;
    }
}
