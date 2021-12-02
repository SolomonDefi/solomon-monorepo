// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.9;

import "./Ownable.sol";
import "./IERC20.sol";
import "./SlmJudgement.sol";
import "../SlmStakerStorage.sol";

abstract contract SlmShared is Ownable {

    IERC20 public token;

    SlmJudgement public judge;

    SlmStakerStorage public stakerStorage;

    address internal _party1;

    address internal _party2;

    string internal _party1EvidenceURL;

    string internal _party2EvidenceURL;

    uint256 public disputeTime;

    uint256 public disputePeriod = 7 days;

    uint256 public jurorFees = 1500;

    uint256 public upkeepFees = 500;

    uint8 public discount = 0;

    TransactionState public state = TransactionState.Inactive;

    event Funded(uint256 amount);

    // Dispute/Voting State
    enum TransactionState {
        // Awaiting initial funds
        Inactive,
        // Initialized but awaiting SLM or ETH
        Active,
        // A dispute has been initiated
        VotePending,
        // Party1 received funds, contract complete
        CompleteParty1,
        // Party received funds, contract complete
        CompleteParty2
    }

    event DisputeInitiated(address indexed party1, address indexed party2);

    event Evidence(address indexed party, string evidenceURL);

    /// Shared contract initialization
    /// @param _judge Contract that assigns votes for transaction disputes
    /// @param _token Token for ERC20 payments
    /// @param _stakerStorage Contract that handles staker balances
    /// @param _owner The address of the contract owner
    /// @param _p1 The address of the first party
    /// @param _p2 The address of the second party
    function initialize(address _judge, address _token, address _stakerStorage, address _owner, address _p1, address _p2) internal {
        require(_judge != address(0), "Zero addr");
        require(_token != address(0), "Zero addr");
        require(_stakerStorage != address(0), "Zero addr");
        require(_owner != address(0), "Zero addr");
        require(_p1 != address(0), "Zero addr");
        require(_p2 != address(0), "Zero addr");
        require(state == TransactionState.Inactive, "Only initialize once");
        judge = SlmJudgement(_judge);
        token = IERC20(_token);
        stakerStorage = SlmStakerStorage(_stakerStorage);
        owner = _owner;
        _party1 = _p1;
        _party2 = _p2;
        state = TransactionState.Active;
    }

    // Initiate a transaction dispute
    function _initiateDispute() internal {
        state = TransactionState.VotePending;
        emit DisputeInitiated(_party1, _party2);
        disputeTime = block.timestamp;
    }

    /// Second party dispute evidence
    /// @param _evidenceURL Link to real-world evidence
    function _party1Evidence(string memory _evidenceURL) internal {
        require(state == TransactionState.VotePending, "No dispute active");
        require(msg.sender == _party1, "Invalid sender");
        require(bytes(_evidenceURL).length > 0, "Evidence required");
        require(bytes(_party1EvidenceURL).length == 0, "Evidence already provided");
        _party1EvidenceURL = _evidenceURL;
        emit Evidence(_party1, _evidenceURL);
    }

    /// Second party dispute evidence
    /// @param _evidenceURL Link to real-world evidence
    function _party2Evidence(string memory _evidenceURL) internal {
        require(state == TransactionState.VotePending, "No dispute active");
        require(msg.sender == _party2, "Invalid sender");
        require(bytes(_evidenceURL).length > 0, "Evidence required");
        require(bytes(_party2EvidenceURL).length == 0, "Evidence already provided");
        _party2EvidenceURL = _evidenceURL;
        emit Evidence(_party2, _evidenceURL);
    }

    /// Internal function for dispersing funds
    /// @param recipient Recipient of funds
    function withdraw(address recipient, address owner) internal {
        require(recipient != address(0), "Zero addr");
        require(owner != address(0), "Zero addr");
        require(block.timestamp > (disputeTime + disputePeriod), "Cannot withdraw yet");
        // TODO -- transfer fee
        uint256 totalBalance;
        if(address(token) == address(0)) {
            totalBalance = address(this).balance;
        } else {
            totalBalance = token.balanceOf(address(this));
        }
        uint256 jurorFeeAmount = ((totalBalance * jurorFees) * (100 - discount)) / ( 100000 * 100);
        uint256 upkeepFeeAmount = ((totalBalance * upkeepFees) * (100 - discount)) / ( 100000 * 100);
        uint256 transferAmount = totalBalance - jurorFeeAmount - upkeepFeeAmount;
        if(address(token) == address(0)) {
            payable(recipient).transfer(transferAmount);
            payable(owner).transfer(upkeepFeeAmount);
            payable(address(stakerStorage)).transfer(address(this).balance);
        } else {
            token.transfer(recipient, transferAmount);
            token.transfer(owner, upkeepFeeAmount);
            token.transfer(address(stakerStorage), token.balanceOf(address(this)));
        }
    }
}