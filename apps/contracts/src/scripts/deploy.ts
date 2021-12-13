import hardhat from 'hardhat'
const ethers = hardhat['ethers']

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
} from './deployUtils'

// Declare constants for contract deployment
let tokenAddress = '[PROD TOKEN ADDRESS]'
const initialSupply = '100000000000000000000000000'
const unstakePeriod = 1
const minimumStake = 1
const minJurorCount = 3
const jurorFees = 0
const upkeepFees = 0
const discount = 0

// Print deployed addresses to console
const printContractAddresses = (name, contractAddress) => {
  console.log('[DEPLOYED]', name, 'address:', contractAddress)
}

async function main() {
  const [deployer] = await ethers.getSigners()
  const network = await ethers.provider.getNetwork()

  console.log(
    `Deploying contracts to ${network.name} (${network.chainId}) with account: ${deployer.address}`,
    deployer.address,
  )

  // Check deployer balance before deployment
  console.log('Account balance:', (await deployer.getBalance()).toString())

  const factories = await getFactories()

  // Deploy token contract for dev and testnet environments
  if (network.chainId === 1337) {
    // Local RPC
    const { erc20 } = await deployToken(
      factories.TokenFactory,
      deployer.address,
      initialSupply,
    )
    tokenAddress = erc20.address
    printContractAddresses('Token', tokenAddress)
    await erc20.deployed()
    await erc20.unlock()
  } else if (network.chainId === 3) {
    // Ropsten testnet
    const { erc20 } = await deployToken(
      factories.TokenFactory,
      deployer.address,
      initialSupply,
    )
    tokenAddress = erc20.address
    printContractAddresses('Token', tokenAddress)
    await erc20.deployed()
    await erc20.unlock()
  }

  // Deploy SlmStakerStorage contract and set contract references
  const { storage } = await deployStakerStorage(
    factories.StorageFactory,
    tokenAddress,
    unstakePeriod,
    minimumStake,
  )
  printContractAddresses('SlmStakerStorage', storage.address)

  // Deploy SlmStakerManager contract and set contract references
  const { manager } = await deployStakerManager(
    factories.ManagerFactory,
    tokenAddress,
    storage.address,
  )
  printContractAddresses('SlmStakerManager', manager.address)
  await storage.setStakerManager(manager.address)

  // Deploy SlmJudgement contract and set contract references
  const { judgement } = await deployJudgement(
    factories.JudgementFactory,
    manager.address,
    minJurorCount,
  )
  printContractAddresses('SlmJudgement', judgement.address)
  await manager.setJudgementContract(judgement.address)

  // Deploy Chargeback master contract
  const { chargebackMaster } = await deployChargebackMaster(factories.ChargebackFactory)
  printContractAddresses('SlmChargeback Master', chargebackMaster.address)

  // Deploy Preorder master contract
  const { preorderMaster } = await deployPreorderMaster(factories.PreorderFactory)
  printContractAddresses('SlmPreorder Master', preorderMaster.address)

  // Deploy Escrow master contract
  const { escrowMaster } = await deployEscrowMaster(factories.EscrowFactory)
  printContractAddresses('SlmEscrow Master', escrowMaster.address)

  // Deploy SLMFactory
  const { slmFactory } = await deploySlmFactory(
    factories.SLMFactory,
    judgement.address,
    tokenAddress,
    storage.address,
    chargebackMaster.address,
    preorderMaster.address,
    escrowMaster.address,
    jurorFees,
    upkeepFees,
    discount,
  )
  printContractAddresses('SlmFactory', slmFactory.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
