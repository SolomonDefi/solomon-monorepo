import assert from 'assert'
import { ethers } from 'hardhat'

import {
  getFactories,
  deployToken,
  deployStakerStorage,
  deployStakerManager,
  deployJudgement,
  deployChargebackMaster,
  deployEscrowMaster,
  deployPreorderMaster,
  deploySlmFactory,
  deployChargebackChild,
  deployPreorderChild,
  deployEscrowChild,
} from '../scripts/deployUtils'

// Temporary placeholders for blockchain-utils functions
export const toBN = (num) => BigInt(toSafeNumber(num))

const addDays = (date, days) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const parseSci = (value) => {
  const eInd = value.indexOf('e')
  if (eInd !== -1) {
    const vals = value.split('e')
    const exp = (vals[1].startsWith('+') ? vals[1].slice(1) : vals[1]) || '0'
    let val = vals[0]
    if (val.length === 0 || Number.isNaN(parseInt(val))) {
      throw Error(`Cannot parse ${value}`)
    }
    const dotInd = val.indexOf('.')
    let addZeros = parseInt(exp)
    val = val.replace('.', '')
    if (dotInd !== -1) {
      addZeros -= val.length - dotInd
      if (addZeros < 0) {
        return `${val.slice(0, addZeros)}.${val.slice(addZeros)}`
      }
    }
    return `${val}${'0'.repeat(addZeros)}`
  }
  return value
}

export const toSafeNumber = (value) => parseSci(value.toString())

// End of temporary placeholders

export async function setAccess(jurorObject, disputeAddress, roleArray, userArray, encryptionKey) {

  let addressArray = []
  let encryptionKeyArray = []

  for(let i = 0; i < roleArray.length; i++) {
    addressArray.push(userArray[i].address)
    let encryptedString = await createEncryptedString(roleArray[i], userArray[i].address, encryptionKey)
    encryptionKeyArray.push(encryptedString)
  }

  await jurorObject.setDisputeAccess(
    disputeAddress,
    roleArray,
    addressArray,
    encryptionKeyArray,
  )
}

export async function createEncryptedString(role, address, encryptionKey) {
  if (role === 1 || role === 2) {
    return ethers.utils.solidityKeccak256(
      ['address', 'bytes32'],
      [address, encryptionKey],
    )
  } else {
    return ethers.utils.solidityKeccak256(
      ['address', 'bytes32', 'uint8'],
      [address, encryptionKey, 1],
    )
  }
}

export async function encryptVote(address, encryptionKey, vote) {
  return ethers.utils.solidityKeccak256(
    ['address', 'bytes32', 'uint8'],
    [address, encryptionKey, vote],
  )
}

export async function sendVote(
  jurorObject,
  userObject,
  disputeAddress,
  encryptionKey,
  vote,
) {
  const encryptedVote = ethers.utils.solidityKeccak256(
    ['address', 'bytes32', 'uint8'],
    [userObject.address, encryptionKey, vote],
  )

  await jurorObject.connect(userObject).vote(disputeAddress, encryptedVote)
}

export async function stake(tokenObject, managerObject, userObject, userId, stakeAmount) {
  await tokenObject
    .connect(userObject)
    .increaseAllowance(managerObject.address, stakeAmount)
  await managerObject.connect(userObject).stake(userId, stakeAmount)
}

export async function unstake(managerObject, userObject) {
  await managerObject.connect(userObject).unstake()
}

export async function increaseTime(days, start) {
  const now = new Date(start * 1000)
  const later = addDays(now, days).getTime()
  const time = Math.round((later - now.getTime()) / 1000)
  await ethers.provider.send('evm_increaseTime', [time])
  return start + time
}

export async function deployContracts(
  supplyAmount = 100000000,
  unstakePeriod = 1,
  minimumStake = 1,
  minJurorCount = 3,
  jurorFees = 0,
  upkeepFees = 0,
  discount = 10,
) {
  const [owner] = await ethers.getSigners()

  // Set up contract factories for deployment
  const {
    StorageFactory,
    ManagerFactory,
    TokenFactory,
    JudgementFactory,
    SLMFactory,
    ChargebackFactory,
    PreorderFactory,
    EscrowFactory,
  } = await getFactories()

  // Deploy token contract and unlock tokens
  const initialSupply = ethers.utils.parseEther(supplyAmount.toString())
  const { erc20: token } = await deployToken(TokenFactory, owner.address, initialSupply)
  await token.deployed()
  await token.unlock()

  // Deploy staker storage contract
  const { storage } = await deployStakerStorage(
    StorageFactory,
    token.address,
    unstakePeriod,
    minimumStake,
  )

  // Deploy staker manager contract
  const { manager } = await deployStakerManager(
    ManagerFactory,
    token.address,
    storage.address,
  )
  await storage.setStakerManager(manager.address)

  // Deploy juror contract
  const { judgement: jurors } = await deployJudgement(
    JudgementFactory,
    manager.address,
    minJurorCount,
  )
  await manager.setJudgementContract(jurors.address)

  // Deploy chargeback contract
  const { chargebackMaster } = await deployChargebackMaster(ChargebackFactory)

  // Deploy preorder contract
  const { preorderMaster } = await deployPreorderMaster(PreorderFactory)

  // Deploy escrow contract
  const { escrowMaster } = await deployEscrowMaster(EscrowFactory)

  // Deploy SLM Factory contracts
  const { slmFactory } = await deploySlmFactory(
    SLMFactory,
    jurors.address,
    token.address,
    storage.address,
    chargebackMaster.address,
    preorderMaster.address,
    escrowMaster.address,
    jurorFees,
    upkeepFees,
    discount,
  )

  return [token, manager, storage, jurors, slmFactory]
}

export async function deployChargeback(
  slmFactory,
  token,
  disputeID,
  merchant,
  buyer,
  amount,
) {
  const chargeback = await deployChargebackChild(
    slmFactory,
    token,
    disputeID,
    merchant,
    buyer,
    amount,
  )

  return chargeback
}

export async function deployPreorder(
  slmFactory,
  token,
  disputeID,
  merchant,
  buyer,
  amount,
) {
  const preorder = await deployPreorderChild(
    slmFactory,
    token,
    disputeID,
    merchant,
    buyer,
    amount,
  )

  return preorder
}

export async function deployEscrow(slmFactory, token, disputeID, party1, party2, amount) {
  const escrow = await deployEscrowChild(
    slmFactory,
    token,
    disputeID,
    party1,
    party2,
    amount,
  )

  return escrow
}
