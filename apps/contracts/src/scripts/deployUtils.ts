import { ethers } from 'hardhat'

export const getFactories = async () => {
  const StorageFactory = await ethers.getContractFactory('SlmStakerStorage')
  const ManagerFactory = await ethers.getContractFactory('SlmStakerManager')
  const TokenFactory = await ethers.getContractFactory('SlmToken')
  const JudgementFactory = await ethers.getContractFactory('SlmJudgement')
  const SLMFactory = await ethers.getContractFactory('SlmFactory')
  const ChargebackFactory = await ethers.getContractFactory('SlmChargeback')
  const PreorderFactory = await ethers.getContractFactory('SlmPreorder')
  const EscrowFactory = await ethers.getContractFactory('SlmEscrow')

  return {
    StorageFactory,
    ManagerFactory,
    TokenFactory,
    JudgementFactory,
    SLMFactory,
    ChargebackFactory,
    PreorderFactory,
    EscrowFactory,
  }
}

export const deployToken = async (factory, owner, initialSupply) => {
  const erc20 = await factory.deploy('Test ERC20', 'T20', initialSupply, owner)
  return { erc20 }
}

export const deployStakerStorage = async (
  factory,
  tokenAddress,
  unstakePeriod,
  minimumStake,
) => {
  const storage = await factory.deploy(tokenAddress, unstakePeriod, minimumStake)
  return { storage }
}

export const deployStakerManager = async (factory, tokenAddress, storageAddress) => {
  const manager = await factory.deploy(tokenAddress, storageAddress)
  return { manager }
}

export const deployJudgement = async (
  factory,
  managerAddress,
  minJurorCount,
  tieDuration,
) => {
  const judgement = await factory.deploy(managerAddress, minJurorCount, tieDuration)
  return { judgement }
}

export const deployChargebackMaster = async (factory) => {
  const chargebackMaster = await factory.deploy()
  return { chargebackMaster }
}

export const deployPreorderMaster = async (factory) => {
  const preorderMaster = await factory.deploy()
  return { preorderMaster }
}

export const deployEscrowMaster = async (factory) => {
  const escrowMaster = await factory.deploy()
  return { escrowMaster }
}

export const deploySlmFactory = async (
  factory,
  jurorAddress,
  tokenAddress,
  chargebackAddress,
  preorderAddress,
  escrowAddress,
  discount,
) => {
  const slmFactory = await factory.deploy(
    jurorAddress,
    tokenAddress,
    chargebackAddress,
    preorderAddress,
    escrowAddress,
    discount,
  )
  return { slmFactory }
}

export async function deployChargebackChild(
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

  // Get chargeback contract object
  const chargebackAddress = await slmFactory.getChargebackAddress(disputeID)
  const chargeback = await ethers.getContractAt('SlmChargeback', chargebackAddress)
  return chargeback
}

export async function deployPreorderChild(
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

  // Get preorder contract object
  const preorderAddress = await slmFactory.getPreorderAddress(disputeID)
  const preorder = await ethers.getContractAt('SlmPreorder', preorderAddress)
  return preorder
}

export async function deployEscrowChild(
  slmFactory,
  token,
  disputeID,
  party1,
  party2,
  amount,
) {
  // Create allowance for transfer of funds into escrow contract
  await token.approve(slmFactory.address, amount)

  // Create new escrow contract
  await slmFactory.createEscrow(disputeID, party1.address, party2.address, token.address)

  // Get escrow contract object
  const escrowAddress = await slmFactory.getEscrowAddress(disputeID)
  const escrow = await ethers.getContractAt('SlmEscrow', escrowAddress)
  return escrow
}
