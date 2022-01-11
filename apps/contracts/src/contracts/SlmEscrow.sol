// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.9;

import "./library/SlmShared.sol";
import "./library/SlmJudgement.sol";

/// @title Solomon Escrow
/// @author Solomon DeFi
/// @notice A contract that holds ETH or ERC20 tokens in escrow until both parties agree to disperse funds
contract SlmEscrow is SlmShared {

    /// @dev Flag to indicate if dispute has been initiated
    bool disputeInitiated;

    /// @dev Flag to mark final withdrawal in case of ties
    bool finalWithdrawal;

    /// Initialize the contract
    /// @param _judge Contract that assigns votes for chargeback disputes
    /// @param _token Token for ERC20 payments
    /// @param _stakerStorage Contract that handles staker balances
    /// @param _p1 The address of the first party to the escrow agreement
    /// @param _p2 The address of the second party to the escrow agreement
    /// @param _jurorFees Part of transaction fee going to jurors
    /// @param _upkeepFees Part of transaction fee going to contract owner
    function initializeEscrow(
        address _judge,
        address _token,
        address _stakerStorage,
        address _owner,
        address _p1,
        address _p2,
        uint32 _jurorFees,
        uint32 _upkeepFees
    ) external payable {
        super.initialize(_judge, _token, _stakerStorage, _owner, _p1, _p2);
        disputePeriod = 180 days;
        jurorFees = _jurorFees;
        upkeepFees = _upkeepFees;
        discount = 0;
    }

    /// Get party1 address
    function party1() public view returns (address) {
        return _party1;
    }

    /// Get party2 address
    function party2() public view returns (address) {
        return _party2;
    }

    /// Get party1 escrow evidence URL
    function party1EvidenceURL() external view returns (string memory) {
        return _party1EvidenceURL;
    }

    /// Get party2 escrow evidence URL
    function party2EvidenceURL() external view returns (string memory) {
        return _party2EvidenceURL;
    }

    /// Initiate escrow dispute dispute & submit URL for escrow evidence
    /// @param _evidenceURL Link to real-world dispute evidence
    function initiateDispute(string memory _evidenceURL) external {
        require(msg.sender == _party1 || msg.sender == _party2, "Only parties can dispute");
        require(!disputeInitiated, "Dispute has already been initiated");
        super._initiateDispute();
        if(msg.sender == _party1) {
            super._party1Evidence(_evidenceURL);
        } else {
            super._party2Evidence(_evidenceURL);
        }
        disputeInitiated = true;
    }

    /// Submit URL for party1 escrow dispute evidence
    /// @param _evidenceURL Link to real-world evidence
    function party1Evidence(string memory _evidenceURL) external {
        require(disputeInitiated, "Please first initiate dispute");
        super._party1Evidence(_evidenceURL);
    }

    /// Submit URL for party2 escrow dispute evidence
    /// @param _evidenceURL Link to real-world evidence
    function party2Evidence(string memory _evidenceURL) external {
        require(disputeInitiated, "Please first initiate dispute");
        super._party2Evidence(_evidenceURL);
    }

    /// Allow either party to withdraw if eligible
    /// @param encryptionKey Secret key used for user authentication
    function withdrawFunds(bytes32 encryptionKey) external {
        require(msg.sender == _party1 || msg.sender == _party2, "Only parties can withdraw");
        judge.authorizeUser(address(this), msg.sender, encryptionKey);

        bool eligibleWithdrawal = false;
        bool isTie = false;
        SlmJudgement.VoteStates voteResult = judge.getVoteResults(address(this), encryptionKey);
        if(voteResult == SlmJudgement.VoteStates.BuyerWins || voteResult == SlmJudgement.VoteStates.MerchantWins) {
            eligibleWithdrawal = true;
        } else if (voteResult == SlmJudgement.VoteStates.Tie) {
            isTie = true;
        }
        require(eligibleWithdrawal || isTie, "Cannot withdraw");
        if (voteResult == SlmJudgement.VoteStates.BuyerWins) {
            state = TransactionState.CompleteParty1;
            withdraw(_party1, owner, isTie, finalWithdrawal);
            finalWithdrawal = true;
        } else if (voteResult == SlmJudgement.VoteStates.MerchantWins) {
            state = TransactionState.CompleteParty2;
            withdraw(_party2, owner, isTie, finalWithdrawal);
            finalWithdrawal = true;
        } else {
            // Withdraw for both parties in the case of a tie
            state = TransactionState.CompleteTie;
            withdraw(_party1, owner, isTie, finalWithdrawal);
            finalWithdrawal = true;
            withdraw(_party2, owner, isTie, finalWithdrawal);
        }
    }

}