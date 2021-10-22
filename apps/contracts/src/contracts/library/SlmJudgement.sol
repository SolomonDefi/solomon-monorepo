// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.9;

import './Ownable.sol';
import './IERC20.sol';
import '../SlmStakerManager.sol';

/// @title Solomon Judgement
/// @author Solomon DeFi
/// @notice Functionality for voting on chargeback/escrow events
contract SlmJudgement is Ownable {

    uint16 public minJurorCount;

    SlmStakerManager public stakerManager;

    uint256[] public stakerPool;

    modifier onlyOwnerOrManager() {
        require(msg.sender == owner || msg.sender == address(stakerManager), "Unauthorized access");
        _;
    }

    struct Dispute {
        // Chargeback/escrow votes
        //  1 == Valid voter
        //  2 == Vote in favor of merchant
        //  3 == Vote in favor of buyer
        mapping(address => uint8) votes;
        // Number of votes in favor of merchant
        uint16 merchantVoteCount;
        // Number of votes in favor of buyer
        uint16 buyerVoteCount;
        // Required votes for decision
        uint16 quorum;
    }

    /// Record of SLM contracts to chargeback/escrow votes
    mapping(address => Dispute) public disputes;

    /// Map of available voters
    mapping(address => bool) public voters;

    /// List of juror list per dispute address
    mapping(address => uint256[]) public jurorList;

    /// @dev Mapping of dispute address to Initial Index to Middle Index for Round Robin Mapping
    mapping(address => mapping(uint256 => uint256)) public jurorSelectionIndices;

    constructor(address newStakerManager, uint16 newMinJurorCount) {
        require(newStakerManager != address(0), "Zero addr");
        require(minJurorCount > 0, "Invalid juror count");
        stakerManager = SlmStakerManager(newStakerManager);
        minJurorCount = newMinJurorCount;
    }

    function setStakerManager(address newStakerManager) external onlyOwner {
        require(newStakerManager != address(0), "Zero addr");
        stakerManager = SlmStakerManager(newStakerManager);
    }

    function setMinJurorCount(uint16 newMinJurorCount) external onlyOwner {
        require(newMinJurorCount >= 3, "Minimum juror count must be greater than 3");
        minJurorCount = newMinJurorCount;
    }

    function initializeDispute(address slmContract, uint16 quorum, uint256 endTime) external onlyOwner {
        // TODO -- Access control
        this.setJurors(slmContract);
        disputes[slmContract].quorum = quorum;
        stakerManager.setVoteDetails(slmContract, endTime);
    }

    function vote(address slmContract, uint8 _vote) external {
        require(_vote == 1 || _vote == 2, 'Invalid vote');
        require(disputes[slmContract].votes[msg.sender] == 1, 'Voter ineligible');
        disputes[slmContract].votes[msg.sender] = _vote;
        if(_vote == 2) {
            disputes[slmContract].merchantVoteCount += 1;
        } else {
            disputes[slmContract].buyerVoteCount += 1;
        }
    }

    /// Get the result of a contract dispute
    /// @param slmContract Contract to check dispute status
    function voteStatus(address slmContract) public view returns(uint8) {
        Dispute storage dispute = disputes[slmContract];
        uint16 merchantVotes = dispute.merchantVoteCount;
        uint16 buyerVotes = dispute.buyerVoteCount;
        // No vote exists
        if(dispute.quorum == 0) {
            return 0;
        }
        // Vote not complete
        if(merchantVotes + buyerVotes < dispute.quorum) {
            return 1;
        }
        // Tie goes to the buyer
        if(buyerVotes >= merchantVotes) {
            return 2;
        }
        return 3;
    }

    function setStakerPool() external onlyOwner {
        stakerPool = stakerManager.getStakerPool();
    }

    function setJurors(address slmContract) external onlyOwner {
        uint256[] memory selectedJurors = _selectJurorList(slmContract);
        jurorList[slmContract] = selectedJurors;
    }

    function getJurors(address slmContract) external onlyOwnerOrManager returns(uint256[] memory) {
        return jurorList[slmContract];
    }

    function _selectJurorList(address slmContract) private returns(uint256[] memory) {

        // TODO -- Find better alternative to round robin selection
        uint256[] memory selectedJurors;
        uint256 stakerCount = stakerPool.length;
        uint32 selectedstartCount = 0;
        uint256 middleCount = (stakerCount / 2) + 1;
        bool isOdd = false;
        address userAddress;

        uint32 latestStartCount = selectedstartCount;
        uint256 latestMiddleCount = middleCount;
        uint32 i = 0;
        while(i < minJurorCount) {
            selectedJurors[i] = stakerPool[selectedstartCount];
            userAddress = stakerManager.getUserAddress(selectedJurors[i]);
            disputes[slmContract].votes[userAddress] = 1;
            i += 1;
            selectedstartCount += 1;
            if(selectedstartCount == minJurorCount) {
                selectedstartCount = 0;
            }
            latestStartCount = selectedstartCount;

            if(i < minJurorCount) {
                selectedJurors[i + 1] = stakerPool[middleCount];
                userAddress = stakerManager.getUserAddress(selectedJurors[i]);
                disputes[slmContract].votes[userAddress] = 1;
                i += 1;
                middleCount += 1;
                if(middleCount == minJurorCount) {
                    middleCount = 0;
                }
                latestMiddleCount = middleCount;
            }
        }

        return selectedJurors;
    }
}
