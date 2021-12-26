// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.9;

import "./library/Ownable.sol";
import "./library/CloneFactory.sol";
import "./library/IERC20.sol";
import "./SlmChargeback.sol";
import "./SlmPreorder.sol";
import "./SlmEscrow.sol";

/// @title Solomon Factory
/// @author Solomon DeFi
/// @notice Factory for producing Solomon chargeback, preorder, and escrow contracts
contract SlmFactory is CloneFactory, Ownable {

    /// @dev Address of master Chargeback address
    address public chargebackMasterContract;

    /// @dev Address of master Preorder address
    address public preorderMasterContract;

    /// @dev Address of master Preorder address
    address public escrowMasterContract;

    /// @dev Address of SlmJudgement address
    address public judge;

    /// @dev Address of SlmJudgement address
    address public slmToken;

    /// @dev Address of SlmJudgement address
    address public stakerStorage;

    /// @dev Default discount percentage in whole numbers
    uint8 public slmDiscount;

    /// @dev Default juror fees representing one hundredth of a percent in whole numbers
    uint32 public jurorFees;

    /// @dev Default upkeep fees representing one hundredth of a percent in whole numbers
    uint32 public upkeepFees;

    /// Mapping of dispute ID to Chargeback contract addresses
    mapping(uint256 => address) public chargebackAddressList;

    /// Mapping of dispute ID to Preorder contract addresses
    mapping(uint256 => address) public preorderAddressList;

    /// Mapping of dispute ID to Escrow contract addresses
    mapping(uint256 => address) public escrowAddressList;

    /// Event announcing the creation of Chargeback dispute contract
    /// @param chargebackAddress Address of created contract
    event ChargebackCreated(address chargebackAddress);

    /// Event announcing the creation of Preorder dispute contract
    /// @param preorderAddress Address of created contract
    event PreorderCreated(address preorderAddress);

    /// Event announcing the creation of Escrow dispute contract
    /// @param escrowAddress Address of created contract
    event EscrowCreated(address escrowAddress);

    /// Factory contract initialization
    /// @param _judge Contract that assigns votes for transaction disputes
    /// @param _slmToken Token for ERC20 payments
    /// @param _stakerStorage Contract that handles staker balances
    /// @param _chargebackMasterContract The master address for chargeback dispute contracts
    /// @param _preorderMasterContract The master address for preorder dispute contracts
    /// @param _escrowMasterContract The master address for escrow dispute contracts
    /// @param _jurorFees Default juror fees for dispute contracts representing hundredths of a percent in whole numbers
    /// @param _upkeepFees Default upkeep fees for dispute contracts representing hundredths of a percent in whole numbers
    /// @param _slmDiscount Default discounts on transaction fees representing percent in whole numbers
    constructor(
        address _judge,
        address _slmToken,
        address _stakerStorage,
        address _chargebackMasterContract,
        address _preorderMasterContract,
        address _escrowMasterContract,
        uint32 _jurorFees,
        uint32 _upkeepFees,
        uint8 _slmDiscount
    ) {
        require(_judge != address(0), "Zero addr");
        require(_slmToken != address(0), "Zero addr");
        require(_stakerStorage != address(0), "Zero addr");
        require(_chargebackMasterContract != address(0), "Zero addr");
        require(_preorderMasterContract != address(0), "Zero addr");
        require(_escrowMasterContract != address(0), "Zero addr");
        judge = _judge;
        slmToken = _slmToken;
        slmDiscount = _slmDiscount;
        jurorFees = _jurorFees;
        upkeepFees = _upkeepFees;
        stakerStorage = _stakerStorage;
        chargebackMasterContract = _chargebackMasterContract;
        preorderMasterContract = _preorderMasterContract;
        escrowMasterContract = _escrowMasterContract;
    }

    /// Set discount on transaction fees
    /// @param discount Discount percentage in whole numbers
    function setDiscount(uint8 discount) external onlyOwner {
        slmDiscount = discount;
    }

    /// Set SlmJudgement contract
    /// @param newJudge SlmJudgement contract address
    function setJudgementContract(address newJudge) external onlyOwner {
        require(newJudge != address(0), "Zero addr");
        judge = newJudge;
    }

    /// Set SlmToken contract
    /// @param newSlmToken SlmToken contract address
    function setTokenContract(address newSlmToken) external onlyOwner {
        require(newSlmToken != address(0), "Zero addr");
        slmToken = newSlmToken;
    }

    /// Set Chargeback master contract
    /// @param newChargebackMaster SlmChargeback master contract address
    function setChargebackMaster(address newChargebackMaster) external onlyOwner {
        require(newChargebackMaster != address(0), "Zero addr");
        chargebackMasterContract = newChargebackMaster;
    }

    /// Set Preorder master contract
    /// @param newPreorderMaster SlmPreorder master contract address
    function setPreorderMaster(address newPreorderMaster) external onlyOwner {
        require(newPreorderMaster != address(0), "Zero addr");
        preorderMasterContract = newPreorderMaster;
    }

    /// Set Escrow master contract
    /// @param newEscrowMaster SlmEscrow master contract address
    function setEscrowMaster(address newEscrowMaster) external onlyOwner {
        require(newEscrowMaster != address(0), "Zero addr");
        escrowMasterContract = newEscrowMaster;
    }

    /// Create a new Chargeback clone contract
    /// @param disputeID ID for new dispute
    /// @param merchant Merchant wallet address
    /// @param buyer Buyer wallet address
    /// @param paymentToken Token address
    function createChargeback(uint256 disputeID, address merchant, address buyer, address paymentToken) external payable {
        require(merchant != address(0), "Zero addr");
        require(buyer != address(0), "Zero addr");
        require(paymentToken != address(0), "Zero addr");
        SlmChargeback chargeback = SlmChargeback(createClone(chargebackMasterContract));
        uint8 discount = 0;
        if(paymentToken != address(0)) {
            uint256 allowance = IERC20(paymentToken).allowance(msg.sender, address(this));
            require(allowance > 0, "Allowance missing");
            if(paymentToken == slmToken) {
                discount = slmDiscount;
            }
            IERC20(paymentToken).transferFrom(msg.sender, address(chargeback), allowance);
        } else {
            require(msg.value > 0, "Payment not provided");
        }
        chargeback.initializeChargeback{ value: msg.value }(judge, paymentToken, stakerStorage, owner, merchant, buyer, jurorFees, upkeepFees, discount);
        chargebackAddressList[disputeID] = address(chargeback);
        emit ChargebackCreated(chargebackAddressList[disputeID]);
    }

    /// Create a new Preorder clone contract
    /// @param disputeID ID for new dispute
    /// @param merchant Merchant wallet address
    /// @param buyer Buyer wallet address
    /// @param paymentToken Token address
    function createPreorder(uint256 disputeID, address merchant, address buyer, address paymentToken) external payable {
        require(merchant != address(0), "Zero addr");
        require(buyer != address(0), "Zero addr");
        require(paymentToken != address(0), "Zero addr");
        SlmPreorder preorder = SlmPreorder(createClone(preorderMasterContract));
        uint8 discount = 0;
        if(paymentToken != address(0)) {
            uint256 allowance = IERC20(paymentToken).allowance(msg.sender, address(this));
            require(allowance > 0, "Allowance missing");
            if(paymentToken == slmToken) {
                discount = slmDiscount;
            }
            IERC20(paymentToken).transferFrom(msg.sender, address(preorder), allowance);
        } else {
            require(msg.value > 0, "Payment not provided");
        }
        preorder.initializePreorder{ value: msg.value }(judge, paymentToken, stakerStorage,owner, merchant, buyer, jurorFees, upkeepFees, discount);
        preorderAddressList[disputeID] = address(preorder);
        emit PreorderCreated(preorderAddressList[disputeID]);
    }

    /// Create a new Escrow clone contract
    /// @param disputeID ID for new dispute
    /// @param party1 Party 1 wallet address
    /// @param party2 Party 2 wallet address
    /// @param paymentToken Token address
    function createEscrow(uint256 disputeID, address party1, address party2, address paymentToken) external payable {
        require(party1 != address(0), "Zero addr");
        require(party2 != address(0), "Zero addr");
        require(paymentToken != address(0), "Zero addr");
        SlmEscrow escrow = SlmEscrow(createClone(escrowMasterContract));
        if(paymentToken != address(0)) {
            uint256 allowance = IERC20(paymentToken).allowance(msg.sender, address(this));
            require(allowance > 0, "Allowance missing");
            IERC20(paymentToken).transferFrom(msg.sender, address(escrow), allowance);
        } else {
            require(msg.value > 0, "Payment not provided");
        }
        escrow.initializeEscrow{ value: msg.value }(judge, paymentToken, stakerStorage, owner, party1, party2, jurorFees, upkeepFees);
        escrowAddressList[disputeID] = address(escrow);
        emit EscrowCreated(escrowAddressList[disputeID]);
    }

    /// Get clone Chargeback contract address based on dispute ID
    /// @param disputeID ID for dispute contract
    function getChargebackAddress(uint256 disputeID) external view returns (address) {
        return chargebackAddressList[disputeID];
    }

    /// Get clone Preorder contract address based on dispute ID
    /// @param disputeID ID for dispute contract
    function getPreorderAddress(uint256 disputeID) external view returns (address) {
        return preorderAddressList[disputeID];
    }

    /// Get clone Escrow contract address based on dispute ID
    /// @param disputeID ID for dispute contract
    function getEscrowAddress(uint256 disputeID) external view returns (address) {
        return escrowAddressList[disputeID];
    }
}
