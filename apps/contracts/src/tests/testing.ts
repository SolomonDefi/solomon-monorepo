import assert from 'assert'
import { ethers } from 'hardhat'

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
  tieBreakerDuration = 1,
  jurorFees = 0,
  upkeepFees = 0,
  discount = 10,
) {
  const [owner] = await ethers.getSigners()

  // Set up contract factories for deployment
  const StorageFactory = await ethers.getContractFactory('SlmStakerStorage')
  const ManagerFactory = await ethers.getContractFactory('SlmStakerManager')
  const TokenFactory = await ethers.getContractFactory('SlmToken')
  const JudgementFactory = await ethers.getContractFactory('SlmJudgement')
  const SLMFactory = await ethers.getContractFactory('SlmFactory')
  const ChargebackFactory = await ethers.getContractFactory('SlmChargeback')
  const PreorderFactory = await ethers.getContractFactory('SlmPreorder')
  const EscrowFactory = await ethers.getContractFactory('SlmEscrow')

  // Deploy token contract and unlock tokens
  const initialSupply = ethers.utils.parseEther(supplyAmount.toString())
  const token = await TokenFactory.deploy('SLMToken', 'SLM', initialSupply, owner.address)
  await token.deployed()
  await token.unlock()

  // Deploy staker storage contract
  const storage = await StorageFactory.deploy(token.address, unstakePeriod, minimumStake)

  // Deploy staker manager contract
  const manager = await ManagerFactory.deploy(token.address, storage.address)
  await storage.setStakerManager(manager.address)

  // Deploy juror contract
  const jurors = await JudgementFactory.deploy(manager.address, minJurorCount)
  await manager.setJudgementContract(jurors.address)

  // Deploy chargeback contract
  const chargebackMaster = await ChargebackFactory.deploy()

  // Deploy preorder contract
  const preorderMaster = await PreorderFactory.deploy()

  // Deploy escrow contract
  const escrowMaster = await EscrowFactory.deploy()

  // Deploy SLM Factory contracts
  const slmFactory = await SLMFactory.deploy(
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
  // Create allowance for transfer of funds into chargeback contract
  await token.approve(slmFactory.address, amount)

  // Create new chargeback contract
  await slmFactory.createChargeback(
    disputeID,
    merchant.address,
    buyer.address,
    token.address,
  )
  const chargebackAddress = await slmFactory.getChargebackAddress(disputeID)
  const chargeback = await ethers.getContractAt('SlmChargeback', chargebackAddress)
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
  // Create allowance for transfer of funds into preorder contract
  await token.approve(slmFactory.address, amount)

  // Create new preorder contract
  await slmFactory.createPreorder(
    disputeID,
    merchant.address,
    buyer.address,
    token.address,
  )
  const preorderAddress = await slmFactory.getPreorderAddress(disputeID)
  const preorder = await ethers.getContractAt('SlmPreorder', preorderAddress)
  return preorder
}

export async function deployEscrow(slmFactory, token, disputeID, party1, party2, amount) {
  // Create allowance for transfer of funds into escrow contract
  await token.approve(slmFactory.address, amount)

  // Create new escrow contract
  await slmFactory.createEscrow(disputeID, party1.address, party2.address, token.address)
  const escrowAddress = await slmFactory.getEscrowAddress(disputeID)
  const escrow = await ethers.getContractAt('SlmEscrow', escrowAddress)
  return escrow
}
