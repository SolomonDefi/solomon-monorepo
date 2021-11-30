// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.9;

import "./library/SlmShared.sol";
import "./library/SlmJudgement.sol";

/// @title Solomon Preorder
/// @author Solomon DeFi
/// @notice A contract that holds ETH or ERC20 tokens for preorders/crowdfunding until release conditions are met
contract SlmPreorder is SlmShared {

    uint8 public discount;

    /// Initialize the contract
    /// @param _judge Contract that assigns votes for refund requests
    /// @param _token Token for ERC20 payments
    /// @param _merchant The merchant's address
    /// @param _buyer The buyer's address
    /// @param _discount Discount for transaction fee
    function initializePreorder(
        address _judge,
        address _token,
        address _merchant,
        address _buyer,
        uint8 _discount
    ) external payable {
        super.initialize(_judge, _token, _buyer, _merchant);
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

    /// Buyer initiated refund requests
    /// @param _evidenceURL Link to real-world refund reason
    function requestRefund(string memory _evidenceURL) external {
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
        withdraw(buyer());
    }

    /// Allow merchant to withdraw if eligible
    function merchantWithdraw(bytes32 encryptionKey) external {
        require(msg.sender == merchant(), "Only merchant can withdraw");
        judge.authorizeUser(address(this), msg.sender, encryptionKey);
        require(judge.getVoteResults(address(this), encryptionKey) == SlmJudgement.VoteStates.MerchantWins, "Cannot withdraw");
        state = TransactionState.CompleteParty2;
        withdraw(merchant());
    }

}
