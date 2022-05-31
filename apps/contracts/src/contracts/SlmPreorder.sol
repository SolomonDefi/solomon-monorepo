// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.7;

import "./library/SlmShared.sol";
import "./library/SlmJudgement.sol";

/// @title Solomon Preorder
/// @author Solomon DeFi
/// @notice A contract that holds ETH or ERC20 tokens for preorders/crowdfunding until release conditions are met
contract SlmPreorder is SlmShared {

    /// @dev Flag to indicate if dispute has been initiated
    bool disputeInitiated;

    /// @dev Flag to mark final withdrawal in case of ties
    bool finalWithdrawal;

    /// @dev Flag to mark completion of merchant withdrawal
    bool merchantWithdrawalComplete;

    /// @dev Flag to mark completion of buyer withdrawal
    bool buyerWithdrawalComplete;

    /// Initialize the contract
    /// @param _judge Contract that assigns votes for refund requests
    /// @param _token Token for ERC20 payments
    /// @param _stakerStorage Contract that handles staker balances
    /// @param _merchant The merchant's address
    /// @param _buyer The buyer's address
    /// @param _jurorFees Part of transaction fee going to jurors
    /// @param _upkeepFees Part of transaction fee going to contract owner
    /// @param _discount Discount for transaction fee
    function initializePreorder(
        address _judge,
        address _token,
        address payable _stakerStorage,
        address _owner,
        address _merchant,
        address _buyer,
        uint32 _jurorFees,
        uint32 _upkeepFees,
        uint8 _discount
    ) external payable {
        super.initialize(_judge, _token, _stakerStorage, _owner, _buyer, _merchant);
        disputePeriod = 7 days;
        jurorFees = _jurorFees;
        upkeepFees = _upkeepFees;
        discount = _discount;
    }

    /// Get buyer address
    function buyer() public view returns (address) {
        return _party1;
    }

    /// Get merchant address
    function merchant() public view returns (address) {
        return _party2;
    }

    /// Get buyer's preorder evidence URL
    function buyerEvidenceURL() external view returns (string memory) {
        return _party1EvidenceURL;
    }

    /// Get merchant's preorder evidence URL
    function merchantEvidenceURL() external view returns (string memory) {
        return _party2EvidenceURL;
    }

    /// Initiate preorder dispute & submit URL for buyer preorder evidence
    /// @param _evidenceURL Link to real-world refund reason
    function requestRefund(string memory _evidenceURL) external {
        require(msg.sender == buyer(), "Only buyer can preorder");
        require(!disputeInitiated, "Dispute has already been initiated");
        disputeInitiated = true;
        super._initiateDispute();
        super._party1Evidence(_evidenceURL);
    }

    /// Buyer evidence of completed transaction
    /// @param _evidenceURL Link to real-world evidence
    function buyerEvidence(string memory _evidenceURL) external {
        require(disputeInitiated, "Please first initiate dispute");
        super._party1Evidence(_evidenceURL);
    }

    /// Submit URL for merchant evidence of completed transaction
    /// @param _evidenceURL Link to real-world evidence
    function merchantEvidence(string memory _evidenceURL) external {
        require(disputeInitiated, "Please first initiate dispute");
        super._party2Evidence(_evidenceURL);
    }

    /// Allow buyer to withdraw if eligible
    /// @param encryptionKey Secret key used for user authentication
    function buyerWithdraw(bytes32 encryptionKey) external {
        require(msg.sender == buyer(), "Only buyer can withdraw");
        judge.authorizeUser(address(this), msg.sender, encryptionKey);

        bool eligibleWithdrawal = false;
        bool isTie = false;
        SlmJudgement.VoteStates voteResult = judge.getVoteResults(address(this), encryptionKey);
        if (voteResult == SlmJudgement.VoteStates.BuyerWins) {
            eligibleWithdrawal = true;
        } else if (voteResult == SlmJudgement.VoteStates.Tie) {
            isTie = true;
        }
        require(eligibleWithdrawal || isTie, "Cannot withdraw");

        // Handles withdrawal accordingly based on win or tie
        if (finalWithdrawal) {
            state = TransactionState.CompleteTie;
        } else {
            state = TransactionState.CompleteParty1;
        }

        if (!buyerWithdrawalComplete) {
            buyerWithdrawalComplete = true;
            withdraw(buyer(), owner, isTie, finalWithdrawal);
        }
        finalWithdrawal = true;
    }

    /// Allow merchant to withdraw if eligible
    /// @param encryptionKey Secret key used for user authentication
    function merchantWithdraw(bytes32 encryptionKey) external {
        require(msg.sender == merchant(), "Only merchant can withdraw");
        judge.authorizeUser(address(this), msg.sender, encryptionKey);

        bool eligibleWithdrawal = false;
        bool isTie = false;
        SlmJudgement.VoteStates voteResult = judge.getVoteResults(address(this), encryptionKey);
        if (voteResult == SlmJudgement.VoteStates.MerchantWins) {
            eligibleWithdrawal = true;
        } else if (voteResult == SlmJudgement.VoteStates.Tie) {
            isTie = true;
        }
        require(eligibleWithdrawal || isTie, "Cannot withdraw");

        // Handles withdrawal accordingly based on win or tie
        if (finalWithdrawal) {
            state = TransactionState.CompleteTie;
        } else {
            state = TransactionState.CompleteParty2;
        }

        if (!merchantWithdrawalComplete) {  
            merchantWithdrawalComplete = true;
            withdraw(merchant(), owner, isTie, finalWithdrawal);
        }
        finalWithdrawal = true;
    }

}
