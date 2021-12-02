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

    address public chargebackMasterContract;

    address public preorderMasterContract;

    address public escrowMasterContract;

    address public judge;

    address public slmToken;

    address public stakerStorage;

    uint8 public slmDiscount;

    uint32 public jurorFees;

    uint32 public upkeepFees;

    mapping(uint256 => address) public chargebackAddressList;
     
    mapping(uint256 => address) public preorderAddressList;

    mapping(uint256 => address) public escrowAddressList;

    event ChargebackCreated(address chargebackAddress);

    event PreorderCreated(address preorderAddress);

    event EscrowCreated(address escrowAddress);

    constructor(address _judge, address _slmToken, address _stakerStorage, address _chargebackMasterContract, address _preorderMasterContract, address _escrowMasterContract, uint32 _jurorFees, uint32 _upkeepFees, uint8 _slmDiscount) {
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

    function setDiscount(uint8 discount) external onlyOwner {
        slmDiscount = discount;
    }

    function setJudgementContract(address newJudge) external onlyOwner {
        require(newJudge != address(0), "Zero addr");
        judge = newJudge;
    }
    
    function setTokenContract(address newSlmToken) external onlyOwner {
        require(newSlmToken != address(0), "Zero addr");
        slmToken = newSlmToken;
    }

    function setChargebackMaster(address newChargebackMaster) external onlyOwner {
        require(newChargebackMaster != address(0), "Zero addr");
        chargebackMasterContract = newChargebackMaster;
    }

    function setPreorderMaster(address newPreorderMaster) external onlyOwner {
        require(newPreorderMaster != address(0), "Zero addr");
        preorderMasterContract = newPreorderMaster;
    }

    function setEscrowMaster(address newEscrowMaster) external onlyOwner {
        require(newEscrowMaster != address(0), "Zero addr");
        escrowMasterContract = newEscrowMaster;
    }

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
            IERC20(paymentToken).transferFrom(msg.sender, buyer, allowance);
        } else {
            require(msg.value > 0, "Payment not provided");
        }
        chargeback.initializeChargeback{ value: msg.value }(judge, paymentToken, stakerStorage, owner, merchant, buyer, jurorFees, upkeepFees, discount);
        chargebackAddressList[disputeID] = address(chargeback);
        emit ChargebackCreated(chargebackAddressList[disputeID]);
    }

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
            IERC20(paymentToken).transferFrom(msg.sender, buyer, allowance);
        } else {
            require(msg.value > 0, "Payment not provided");
        }
        preorder.initializePreorder{ value: msg.value }(judge, paymentToken, stakerStorage,owner, merchant, buyer, jurorFees, upkeepFees, discount);
        preorderAddressList[disputeID] = address(preorder);
        emit PreorderCreated(preorderAddressList[disputeID]);
    }

    function createEscrow(uint256 disputeID, address party1, address party2, address paymentToken) external payable {
        require(party1 != address(0), "Zero addr");
        require(party2 != address(0), "Zero addr");
        require(paymentToken != address(0), "Zero addr");
        SlmEscrow escrow = SlmEscrow(createClone(escrowMasterContract));
        if(paymentToken != address(0)) {
            uint256 allowance = IERC20(paymentToken).allowance(msg.sender, address(this));
            require(allowance > 0, "Allowance missing");
            IERC20(paymentToken).transferFrom(msg.sender, party1, allowance);
        } else {
            require(msg.value > 0, "Payment not provided");
        }
        escrow.initializeEscrow{ value: msg.value }(judge, paymentToken, stakerStorage, owner, party1, party2, jurorFees, upkeepFees);
        escrowAddressList[disputeID] = address(escrow);
        emit EscrowCreated(escrowAddressList[disputeID]);
    }

    function getChargebackAddress(uint256 disputeID) external view returns (address) {
        return chargebackAddressList[disputeID];
    }

    function getPreorderAddress(uint256 disputeID) external view returns (address) {
        return preorderAddressList[disputeID];
    }

    function getEscrowAddress(uint256 disputeID) external view returns (address) {
        return escrowAddressList[disputeID];
    }
}
