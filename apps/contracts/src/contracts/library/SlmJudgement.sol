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
    uint256[] private selectedJurors;

    mapping(address => bool) public adminList;

    mapping(address => uint8) public voteResults;

    SlmStakerManager public stakerManager;

    uint256[] public stakerPool;

    uint256 public tieBreakerDuration;

    mapping(address => uint256) public tieBreakerEndTimes;

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

    /// @dev Mapping of dispute address to latest index for Round Robin Mapping
    mapping(address => uint32) public jurorSelectionIndex;

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
        require(newMinJurorCount >= 0, "Invalid juror count");
        minJurorCount = newMinJurorCount;
    }

    function initializeDispute(address slmContract, uint16 quorum, uint256 endTime) external onlyOwner {
        require(slmContract != address(0), "Zero addr");
        require(quorum > 0, "Invalid number");
        require(endTime > 0, "Invalid number");
        // TODO -- Access control
        _setJurors(slmContract);
        disputes[slmContract].quorum = quorum;
        stakerManager.setVoteDetails(slmContract, endTime);
    }

    function vote(address slmContract, uint8 _vote) external {
        require(slmContract != address(0), "Zero addr");
        require(_vote == 1 || _vote == 2, 'Invalid vote');
        require(disputes[slmContract].votes[msg.sender] == 1, 'Voter ineligible');
        disputes[slmContract].votes[msg.sender] = _vote;
        if(_vote == 2) {
            disputes[slmContract].merchantVoteCount += 1;
        } else {
            disputes[slmContract].buyerVoteCount += 1;
        }
    }

    function setAdminRights(address walletAddress) external onlyOwner{
        require(walletAddress != address(0), "Zero addr");

        adminList[walletAddress] = true;
    }

    function removeAdminRights(address walletAddress) external onlyOwner{
        require(walletAddress != address(0), "Zero addr");
        require(this.adminList(walletAddress) == true, "Not an admin");

        adminList[walletAddress] = false;
    }

    function getAdminRights(address walletAddress) external view returns(bool) {
        require(walletAddress != address(0), "Zero addr");
        if(this.adminList(walletAddress) == true) {
            return true;
        }
        return false;
    }

    function setTieBreakerDuration(uint256 newTieBreakerDuration) external onlyOwner{
        require(tieBreakerDuration > 0, "Invalid duration");
        tieBreakerDuration = newTieBreakerDuration;
    }

    function _startTieBreaker(address slmContract) private {
        require(slmContract != address(0), "Zero addr");
        tieBreakerEndTimes[slmContract] = block.timestamp + tieBreakerDuration;
    }

    function tieBreaker(address slmContract, bool buyerWins) external {
        require(slmContract != address(0), "Zero addr");
        if(tieBreakerEndTimes[slmContract] < block.timestamp) {
            voteResults[slmContract] = 2;
        } else {
            require(tieBreakerEndTimes[slmContract] > block.timestamp, "Tie breaker has ended");
            require(adminList[msg.sender] == true, "Not an admin");
            require(voteResults[slmContract] == 4, "Not a tie");

            if(buyerWins) {
                voteResults[slmContract] = 2;
            } else {
                voteResults[slmContract] = 3;
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
        if(dispute.quorum == 0) {
            voteResults[slmContract] = 0;
        }
        // Vote not complete
        else if(merchantVotes + buyerVotes < dispute.quorum) {
            voteResults[slmContract] = 1;
        }
        else if(buyerVotes > merchantVotes) {
            voteResults[slmContract] = 2;
        }
        else if(merchantVotes > buyerVotes) {
            voteResults[slmContract] = 3;
        }
        // Tie breaker
        else {
            voteResults[slmContract] = 4;
            _startTieBreaker(slmContract);
        }
    }

    function getVoteResults(address slmContract) external view returns(uint8) {
        require(slmContract != address(0), "Zero addr");

        return voteResults[slmContract];
    }

    function setStakerPool() external onlyOwner {
        stakerPool = stakerManager.getStakerPool();
    }

    function _setJurors(address slmContract) private {
        require(slmContract != address(0), "Zero addr");
        uint256[] memory selectedJurors = _selectJurorList(slmContract);
        jurorList[slmContract] = selectedJurors;
    }

    function getJurors(address slmContract) external onlyOwnerOrManager view returns(uint256[] memory) {
        require(slmContract != address(0), "Zero addr");
        return jurorList[slmContract];
    }

    function _selectJurorList(address slmContract) private returns(uint256[] memory) {
        require(slmContract != address(0), "Zero addr");

        // TODO -- Find better alternative to round robin selection
        uint256 stakerCount = stakerPool.length;
        require(stakerCount >= minJurorCount, "Not enough stakers");

        uint32 selectedStartCount;
        if(jurorSelectionIndex[slmContract] > 0) {
            selectedStartCount = jurorSelectionIndex[slmContract];
        } else {
            selectedStartCount = 0;
        }
        address userAddress;

        uint32 i = 0;

        while(i < minJurorCount) {
            selectedJurors.push(stakerPool[selectedStartCount]);

            userAddress = stakerManager.getUserAddress(selectedJurors[i]);
            disputes[slmContract].votes[userAddress] = 1;

            i += 1;
            selectedStartCount += 1;

            if(selectedStartCount == stakerCount) {
                selectedStartCount = 0;
            }
            
            jurorSelectionIndex[slmContract] = selectedStartCount;
        }

        return selectedJurors;
    }
}
