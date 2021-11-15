// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.9;

import "./library/SlmShared.sol";

/// @title Solomon Escrow
/// @author Solomon DeFi
/// @notice A contract that holds ETH or ERC20 tokens in escrow until both parties agree to disperse funds
contract SlmEscrow is SlmShared {

    /// Initialize the contract
    /// @param _judge Contract that assigns votes for chargeback disputes
    /// @param _token Token for ERC20 payments
    /// @param _p1 The address of the first party to the escrow agreement
    /// @param _p2 The address of the second party to the escrow agreement
    function initializeEscrow(
        address _judge,
        address _token,
        address _p1,
        address _p2
    ) external payable {
        super.initialize(_judge, _token, _p1, _p2);
        disputePeriod = 180 days;
    }

    function party1() public view returns (address) {
        return _party1;
    }

    function party2() public view returns (address) {
        return _party2;
    }

    function party1EvidenceURL() external view returns (string memory) {
        return _party1EvidenceURL;
    }

    function party2EvidenceURL() external view returns (string memory) {
        return _party2EvidenceURL;
    }

    /// Initiate escrow dispute dispute
    /// @param _evidenceURL Link to real-world dispute evidence
    function initiateDispute(string memory _evidenceURL) external {
        require(msg.sender == _party1 || msg.sender == _party2, "Only parties can dispute");
        super._initiateDispute();
        if(msg.sender == _party1) {
            super._party1Evidence(_evidenceURL);
        } else {
            super._party2Evidence(_evidenceURL);
        }
    }

    /// First party dispute evidence
    /// @param _evidenceURL Link to real-world evidence
    function party1Evidence(string memory _evidenceURL) external {
        super._party1Evidence(_evidenceURL);
    }

    /// Second party dispute evidence
    /// @param _evidenceURL Link to real-world evidence
    function party2Evidence(string memory _evidenceURL) external {
        super._party2Evidence(_evidenceURL);
    }

    /// Allow either party to withdraw if eligible
    function withdrawFunds(bytes32 encryptionKey) external {
        require(msg.sender == _party1 || msg.sender == _party2, "Only parties can withdraw");
        require(judge.getVoteResults(address(this), encryptionKey) == 2 || judge.getVoteResults(address(this), encryptionKey) == 3, "Cannot withdraw");
        state = TransactionState.CompleteParty1;
        uint8 voteResult = judge.getVoteResults(address(this), encryptionKey);
        if (voteResult == 2) {
            withdraw(_party1);
        } else if (voteResult == 3) {
            withdraw(_party2);
        }
    }

}