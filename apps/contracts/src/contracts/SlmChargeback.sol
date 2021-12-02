// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.9;

import "./library/SlmShared.sol";
import "./library/SlmJudgement.sol";

/// @title Solomon Chargeback
/// @author Solomon DeFi
/// @notice A contract that holds ETH or ERC20 tokens until purchase conditions are met
contract SlmChargeback is SlmShared {
    
    SlmJudgement public judgement;

    /// Initialize the contract
    /// @param _judge Contract that assigns votes for chargeback disputes
    /// @param _token Token for ERC20 payments
    /// @param _stakerStorage Contract that handles staker balances
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

    function buyer() public view returns (address) {
        return _party1;
    }

    function merchant() public view returns (address) {
        return _party2;
    }

    function buyerEvidenceURL() external view returns (string memory) {
        return _party1EvidenceURL;
    }

    function merchantEvidenceURL() external view returns (string memory) {
        return _party2EvidenceURL;
    }

    /// Buyer initiated chargeback dispute
    /// @param _evidenceURL Link to real-world chargeback evidence
    function requestChargeback(string memory _evidenceURL) external {
        require(msg.sender == buyer(), "Only buyer can chargeback");
        super._initiateDispute();
        super._party1Evidence(_evidenceURL);
    }

    /// Merchant evidence of completed transaction
    /// @param _evidenceURL Link to real-world evidence
    function merchantEvidence(string memory _evidenceURL) external {
        super._party2Evidence(_evidenceURL);
    }

    /// Allow buyer to withdraw if eligible
    function buyerWithdraw(bytes32 encryptionKey) external {
        require(msg.sender == buyer(), "Only buyer can withdraw");
        judge.authorizeUser(address(this), msg.sender, encryptionKey);
        require(judge.getVoteResults(address(this), encryptionKey) == SlmJudgement.VoteStates.BuyerWins, "Cannot withdraw");
        state = TransactionState.CompleteParty1;
        withdraw(buyer(), owner);
    }

    /// Allow merchant to withdraw if eligible
    function merchantWithdraw(bytes32 encryptionKey) external {
        require(msg.sender == merchant(), "Only merchant can withdraw");
        judge.authorizeUser(address(this), msg.sender, encryptionKey);
        require(judge.getVoteResults(address(this), encryptionKey) == SlmJudgement.VoteStates.MerchantWins, "Cannot withdraw");
        state = TransactionState.CompleteParty2;
        withdraw(merchant(), owner);
    }
}
