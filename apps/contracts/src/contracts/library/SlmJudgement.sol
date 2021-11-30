// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.9;

import "./Ownable.sol";
import "./IERC20.sol";
import "../SlmStakerManager.sol";

/// @title Solomon Judgement
/// @author Solomon DeFi
/// @notice Functionality for voting on chargeback/escrow events
contract SlmJudgement is Ownable {

    // TODO - Add events for certain actions
    // TODO - Reassess how to handle tiebreakers or just let it be
    
    uint16 public minJurorCount;
    uint256[] private selectedJurors;

    enum VoteStates { 
        Inactive,
        InsufficientVotes,
        BuyerWins,
        MerchantWins,
        Tie
    }

    VoteStates public states;

    mapping(address => bool) public adminList;

    mapping(address => VoteStates) public voteResults;

    /// Record of SLM contracts to chargeback/escrow votes
    mapping(address => Dispute) public disputes;

    mapping(address => Role) private disputeRoles;

    /// Map of available voters
    mapping(address => bool) public voters;

    /// List of juror list per dispute address
    mapping(address => uint256[]) public jurorList;

    /// @dev Mapping of dispute address to latest index for Round Robin Mapping
    mapping(address => uint32) public jurorSelectionIndex;

    mapping(address => uint256) public tieBreakerEndTimes;

    // mapping(address => bytes32) public encryptedKeyList;

    SlmStakerManager public stakerManager;

    uint256[] public stakerPool;

    uint256 public tieBreakerDuration;

    modifier onlyOwnerOrManager() {
        require(msg.sender == owner || msg.sender == address(stakerManager), "Unauthorized access");
        _;
    }

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
        // Status of the tiebreaker if needed
        bool tieBreakComplete;
    }

    enum MemberRole {
        Inactive,
        Merchant,
        Buyer,
        Juror
    }

    struct Role {
        // Member role
        //  1 == Merchant
        //  2 == Buyer
        //  3 == Juror
        mapping(address => MemberRole) memberRoles;
        mapping(address => bytes32) encryptedKeyList;
    }

    constructor(address newStakerManager, uint16 newMinJurorCount, uint256 newTieBreakerDuration) {
        require(newStakerManager != address(0), "Zero addr");
        require(newMinJurorCount > 0, "Invalid juror count");
        require(newTieBreakerDuration > 0, "Invalid duration");
        stakerManager = SlmStakerManager(newStakerManager);
        minJurorCount = newMinJurorCount;
        tieBreakerDuration = newTieBreakerDuration;
    }

    function setStakerManager(address newStakerManager) external onlyOwner {
        require(newStakerManager != address(0), "Zero addr");
        stakerManager = SlmStakerManager(newStakerManager);
    }

    function setMinJurorCount(uint16 newMinJurorCount) external onlyOwner {
        require(newMinJurorCount >= 3, "Invalid juror count");
        minJurorCount = newMinJurorCount;
    }

    function initializeDispute(address slmContract, uint16 quorum, uint256 endTime) external onlyOwner {
        require(slmContract != address(0), "Zero addr");
        require(quorum > 0, "Invalid quorum");
        require(endTime > 0, "Invalid endTime");
        
        _setJurors(slmContract);
        disputes[slmContract].quorum = quorum;
        disputes[slmContract].voteEndTime = endTime;
        stakerManager.setVoteDetails(slmContract, endTime);
    }

    function setDisputeAccess(address slmContract, MemberRole[] memory roles, address[] memory addressList, bytes32[] memory keyList) external onlyOwner {
        require(slmContract != address(0), "Zero addr");
        require(addressList.length == keyList.length && keyList.length == roles.length, "Invalid array length");
        require(roles.length > 0, "Empty array");
        Role storage disputeRole = disputeRoles[slmContract];
        for (uint32 i = 0; i < roles.length; i++) {
            disputeRole.memberRoles[addressList[i]] = roles[i];
            disputeRole.encryptedKeyList[addressList[i]] = keyList[i];
        }
    }

    function vote(address slmContract, bytes32 encryptionKey, bytes32 vote) external {
        require(slmContract != address(0), "Zero addr");
        require(disputes[slmContract].voteEndTime > block.timestamp, "Voting has ended");
        stakerManager.managedVote(msg.sender, slmContract);
        Role storage roles = disputeRoles[slmContract];
        require(roles.memberRoles[msg.sender] == MemberRole.Juror, "Voter ineligible");
        if (roles.encryptedKeyList[msg.sender] == vote) {
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
    }

    function setAdminRights(address walletAddress) external onlyOwner {
        require(walletAddress != address(0), "Zero addr");

        adminList[walletAddress] = true;
    }

    function removeAdminRights(address walletAddress) external onlyOwner {
        require(walletAddress != address(0), "Zero addr");
        require(this.adminList(walletAddress) == true, "Not an admin");

        adminList[walletAddress] = false;
    }

    function getAdminRights(address walletAddress) external view returns(bool) {
        require(walletAddress != address(0), "Zero addr");
        if (this.adminList(walletAddress) == true) {
            return true;
        }
        return false;
    }

    function setTieBreakerDuration(uint256 newTieBreakerDuration) external onlyOwner {
        require(tieBreakerDuration > 0, "Invalid duration");
        tieBreakerDuration = newTieBreakerDuration;
    }

    function _startTieBreaker(address slmContract) private {
        require(slmContract != address(0), "Zero addr");
        tieBreakerEndTimes[slmContract] = block.timestamp + tieBreakerDuration;
    }

    function tieBreaker(address slmContract, bool voteForBuyer) external {
        require(slmContract != address(0), "Zero addr");
        require(disputes[slmContract].voteEndTime < block.timestamp, "Voting period still active");
        if (tieBreakerEndTimes[slmContract] < block.timestamp) {
            voteResults[slmContract] = VoteStates.BuyerWins;
        } else {
            require(tieBreakerEndTimes[slmContract] > block.timestamp, "Tie breaker has ended");
            require(adminList[msg.sender] == true, "Not an admin");
            require(voteResults[slmContract] == VoteStates.Tie, "Not a tie");

            if (voteForBuyer) {
                voteResults[slmContract] = VoteStates.BuyerWins;
            } else {
                voteResults[slmContract] = VoteStates.MerchantWins;
            }
        }        
    }

    /// Get the result of a contract dispute
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
        // Tie breaker
        } else {
            voteResults[slmContract] = VoteStates.Tie;
            if (dispute.voteEndTime < block.timestamp) {
                _startTieBreaker(slmContract);
            }
        }
    }

    function authorizeUser(address slmContract, address user, bytes32 encryptionKey) external view {
        Role storage roles = disputeRoles[slmContract];
        require(roles.encryptedKeyList[user] == keccak256(abi.encodePacked(user, encryptionKey)), "Unauthorized access");
    }

    function getVoteResults(address slmContract, bytes32 encryptionKey) external view returns(VoteStates) {
        require(slmContract != address(0), "Zero addr");
        Dispute storage dispute = disputes[slmContract];
        Role storage roles = disputeRoles[slmContract];
        if (dispute.voteEndTime > block.timestamp || tieBreakerEndTimes[slmContract] > block.timestamp) {
            require(roles.memberRoles[msg.sender] == MemberRole.Merchant || roles.memberRoles[msg.sender] == MemberRole.Buyer || adminList[msg.sender] == true, "Unauthorized role");
            this.authorizeUser(slmContract, msg.sender, encryptionKey);
            return voteResults[slmContract];
        }
        return voteResults[slmContract];
    }

    function setStakerPool() external onlyOwner {
        stakerPool = stakerManager.getStakerPool();
    }

    function _setJurors(address slmContract) private {
        require(slmContract != address(0), "Zero addr");
        jurorList[slmContract] = _selectJurorList(slmContract);
    }

    function getJurors(address slmContract) external onlyOwnerOrManager view returns(uint256[] memory) {
        require(slmContract != address(0), "Zero addr");
        return jurorList[slmContract];
    }

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
