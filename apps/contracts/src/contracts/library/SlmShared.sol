// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.9;

import "./Ownable.sol";
import "./IERC20.sol";
import "./SlmJudgement.sol";
import "../SlmStakerStorage.sol";

/// @title Solomon Shared
/// @author Solomon DeFi
/// @notice Underlying parent contract for dispute contracts
abstract contract SlmShared is Ownable {

    /// @dev IERC20 object
    IERC20 public token;

    /// @dev SlmJudgement object
    SlmJudgement public judge;

    /// @dev SlmStakerStorage object
    SlmStakerStorage public stakerStorage;

    /// @dev Party 1 address
    address internal _party1;

    /// @dev Party 2 address
    address internal _party2;

    /// @dev Party 1 evidence URL
    string internal _party1EvidenceURL;

    /// @dev Party 2 evidence URL
    string internal _party2EvidenceURL;

    /// @dev Default discount percentage in whole numbers
    uint8 public discount;

    /// @dev Start of dispute
    uint256 public disputeTime;

    /// @dev Default length of dispute voting period
    uint256 public disputePeriod;

    /// @dev Default juror fees representing one hundredth of a percent in whole numbers
    uint256 public jurorFees;

    /// @dev Default upkeep fees representing one hundredth of a percent in whole numbers
    uint256 public upkeepFees;

    /// @dev Tracks dispute state
    TransactionState public state = TransactionState.Inactive;

    /// @dev Dispute/Voting State
    enum TransactionState {
        // Awaiting initial funds
        Inactive,
        // Initialized but awaiting SLM or ETH
        Active,
        // A dispute has been initiated
        VotePending,
        // Party1 received funds, contract complete
        CompleteParty1,
        // Party2 received funds, contract complete
        CompleteParty2,
        // Both parties received funds, contract completed
        CompleteTie
    }

    /// Event announcing the transfer of funds
    /// @param party Party address
    /// @param amount Amount transferred
    event FundsTransferred(address indexed party, uint256 amount);

    /// Event announcing the initialization of the dispute
    /// @param party1 Party 1 address
    /// @param party2 Party 2 address
    event DisputeInitiated(address indexed party1, address indexed party2);

    /// Event announcing the submission of evidence URL
    /// @param party Party address
    /// @param evidenceURL Link to real-world evidence
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

    /// Submit first party dispute evidence URL
    /// @param _evidenceURL Link to real-world evidence
    function _party1Evidence(string memory _evidenceURL) internal {
        require(state == TransactionState.VotePending, "No dispute active");
        require(msg.sender == _party1, "Invalid sender");
        require(bytes(_evidenceURL).length > 0, "Evidence required");
        _party1EvidenceURL = _evidenceURL;
        emit Evidence(_party1, _evidenceURL);
    }

    /// Submit second party dispute evidence URL
    /// @param _evidenceURL Link to real-world evidence
    function _party2Evidence(string memory _evidenceURL) internal {
        require(state == TransactionState.VotePending, "No dispute active");
        require(msg.sender == _party2, "Invalid sender");
        require(bytes(_evidenceURL).length > 0, "Evidence required");
        _party2EvidenceURL = _evidenceURL;
        emit Evidence(_party2, _evidenceURL);
    }

    /// Internal function for dispersing funds
    /// @param recipient Recipient address of funds
    /// @param owner Owner/Admin address of the contract
    /// @param isTie Flag indicating whether result is a tie
    /// @param finalWithdrawal Flag indicating whether this is final withdrawal
    function withdraw(address recipient, address owner, bool isTie, bool finalWithdrawal) internal {
        require(recipient != address(0), "Zero addr");
        require(owner != address(0), "Zero addr");
        require(block.timestamp > (disputeTime + disputePeriod), "Cannot withdraw yet");
        uint256 totalBalance;
        if (isTie) {
            if (!finalWithdrawal) {
                if (address(token) == address(0)) {
                    totalBalance = (address(this).balance / 2);
                } else {
                    totalBalance = (token.balanceOf(address(this)) / 2);
                }
                if (totalBalance > 0) {
                    _transferFunds(totalBalance, recipient, owner, isTie, finalWithdrawal);
                }
            } else {
                if (address(token) == address(0)) {
                    totalBalance = address(this).balance;
                } else {
                    totalBalance = token.balanceOf(address(this));
                }
                if (totalBalance > 0) {
                    _transferFunds(totalBalance, recipient, owner, isTie, finalWithdrawal);
                }
                }
        } else {
            if (address(token) == address(0)) {
                totalBalance = address(this).balance;
            } else {
                totalBalance = token.balanceOf(address(this));
            }
            if (totalBalance > 0) {
                _transferFunds(totalBalance, recipient, owner, isTie, finalWithdrawal);
            }
        }
    }

    /// Transfer funds and fees to relevant parties
    /// @param totalBalance Total balance to be split among parties
    /// @param recipient Recipient address of funds
    /// @param owner Owner/Admin address of the contract
    /// @param isTie Flag indicating whether result is a tie
    /// @param finalWithdrawal Flag indicating whether this is final withdrawal
    function _transferFunds(uint256 totalBalance, address recipient, address owner, bool isTie, bool finalWithdrawal) private {
        uint256 jurorFeeAmount = ((totalBalance * jurorFees) * (100 - discount)) / ( 100000 * 100);
        uint256 upkeepFeeAmount = ((totalBalance * upkeepFees) * (100 - discount)) / ( 100000 * 100);
        uint256 transferAmount = totalBalance - jurorFeeAmount - upkeepFeeAmount;
        if (address(token) == address(0)) {
            payable(recipient).transfer(transferAmount);
            payable(owner).transfer(upkeepFeeAmount);
            if (isTie && !finalWithdrawal) {
                payable(address(stakerStorage)).transfer(jurorFeeAmount);
            } else {
                payable(address(stakerStorage)).transfer(address(this).balance);
            }
        } else {
            token.transfer(recipient, transferAmount);
            token.transfer(owner, upkeepFeeAmount);
            if (isTie && !finalWithdrawal) {
                token.transfer(address(stakerStorage), jurorFeeAmount);
            } else {
                token.transfer(address(stakerStorage), token.balanceOf(address(this)));
            }
        }
        emit FundsTransferred(recipient, transferAmount);
    }
}