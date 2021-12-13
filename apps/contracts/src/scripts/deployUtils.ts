import hardhat from 'hardhat'
const ethers = hardhat['ethers']

// Get contract factories for Slm contracts
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

// Deploy SlmToken contract
export const deployToken = async (factory, owner, initialSupply) => {
  const erc20 = await factory.deploy('Test ERC20', 'T20', initialSupply, owner)
  return { erc20 }
}

// Deploy SlmStakerStorage contract
export const deployStakerStorage = async (
  factory,
  tokenAddress,
  unstakePeriod,
  minimumStake,
) => {
  const storage = await factory.deploy(tokenAddress, unstakePeriod, minimumStake)
  return { storage }
}

// Deploy SlmStakerManager contract
export const deployStakerManager = async (factory, tokenAddress, storageAddress) => {
  const manager = await factory.deploy(tokenAddress, storageAddress)
  return { manager }
}

// Deploy SlmJudgement contract
export const deployJudgement = async (factory, managerAddress, minJurorCount) => {
  const judgement = await factory.deploy(managerAddress, minJurorCount)
  return { judgement }
}

// Deploy Chargeback master contract
export const deployChargebackMaster = async (factory) => {
  const chargebackMaster = await factory.deploy()
  return { chargebackMaster }
}

// Deploy Preorder master contract
export const deployPreorderMaster = async (factory) => {
  const preorderMaster = await factory.deploy()
  return { preorderMaster }
}

// Deploy Escrow master contract
export const deployEscrowMaster = async (factory) => {
  const escrowMaster = await factory.deploy()
  return { escrowMaster }
}

// Deploy SlmFactory contract
export const deploySlmFactory = async (
  factory,
  judgeAddress,
  tokenAddress,
  stakerStorage,
  chargebackAddress,
  preorderAddress,
  escrowAddress,
  jurorFees,
  upkeepFees,
  discount,
) => {
  const slmFactory = await factory.deploy(
    judgeAddress,
    tokenAddress,
    stakerStorage,
    chargebackAddress,
    preorderAddress,
    escrowAddress,
    jurorFees,
    upkeepFees,
    discount,
  )
  return { slmFactory }
}

// Create Chargeback child dispute contract
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

// Create Preorder child dispute contract
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

// Create Escrow child dispute contract
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
