// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.9;

import "./library/SlmShared.sol";
import "./library/SlmJudgement.sol";

/// @title Solomon Chargeback
/// @author Solomon DeFi
/// @notice A contract that holds ETH or ERC20 tokens until purchase conditions are met
contract SlmChargeback is SlmShared {

    /// @dev Flag to indicate if dispute has been initiated
    bool disputeInitiated;

    /// @dev Flag to mark final withdrawal in case of ties
    bool finalWithdrawal;

    /// @dev Flag to mark completion of merchant withdrawal
    bool merchantWithdrawalComplete;

    /// @dev Flag to mark completion of buyer withdrawal
    bool buyerWithdrawalComplete;

    /// Initialize the contract
    /// @param _judge Contract that assigns votes for chargeback disputes
    /// @param _token Token for ERC20 payments
    /// @param _stakerStorage Contract that handles staker balances
    /// @param _owner The address of the contract owner
    /// @param _merchant The merchant's address
    /// @param _buyer The buyer's address
    /// @param _jurorFees Part of transaction fee going to jurors
    /// @param _upkeepFees Part of transaction fee going to contract owner
    /// @param _discount Discount for transaction fee
    function initializeChargeback(
        address _judge,
        address _token,
        address _stakerStorage,
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

    /// Get buyer's chargeback evidence URL
    function buyerEvidenceURL() external view returns (string memory) {
        return _party1EvidenceURL;
    }

    /// Get merchant's chargeback evidence URL
    function merchantEvidenceURL() external view returns (string memory) {
        return _party2EvidenceURL;
    }

    /// Initiate chargeback dispute & submit URL for buyer chargeback evidence
    /// @param _evidenceURL Link to real-world chargeback evidence
    function requestChargeback(string memory _evidenceURL) external {
        require(msg.sender == buyer(), "Only buyer can chargeback");
        require(!disputeInitiated, "Dispute has already been initiated");
        super._initiateDispute();
        super._party1Evidence(_evidenceURL);
        disputeInitiated = true;
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
        if (judge.getVoteResults(address(this), encryptionKey) == SlmJudgement.VoteStates.BuyerWins) {
            eligibleWithdrawal = true;
        } else if (judge.getVoteResults(address(this), encryptionKey) == SlmJudgement.VoteStates.Tie) {
            isTie = true;
        }
        require(eligibleWithdrawal || isTie, "Cannot withdraw");

        if (finalWithdrawal) {
            state = TransactionState.CompleteTie;
        } else {
            state = TransactionState.CompleteParty1;
        }
        if (!buyerWithdrawalComplete) {
            withdraw(buyer(), owner, isTie, finalWithdrawal);
            buyerWithdrawalComplete = true;
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

        if (finalWithdrawal) {
            state = TransactionState.CompleteTie;
        } else {
            state = TransactionState.CompleteParty2;
        }

        if (!merchantWithdrawalComplete) {
            withdraw(merchant(), owner, isTie, finalWithdrawal);
            merchantWithdrawalComplete = true;
        }
        finalWithdrawal = true;
    }
}
