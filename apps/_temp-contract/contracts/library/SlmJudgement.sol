// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.4;

import './Ownable.sol';
import './IERC20.sol';

/// @title Solomon Judgement
/// @author Solomon DeFi
/// @notice Functionality for voting on chargeback/escrow events
contract SlmJudgement is Ownable {

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

    function initializeDispute(address slmContract, uint16 quorum) external {
        // TODO -- Access control
        // TODO -- Voter selection
        disputes[slmContract].quorum = quorum;
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
    
}
