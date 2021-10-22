import { ethers } from 'hardhat'

const getFactories = async () => {
  const erc20Factory = await ethers.getContractFactory('SlmToken')
  return { erc20Factory }
}

const deployToken = async (factory, owner) => {
  const initialSupply = '100000000000000000000000000'
  const erc20 = await factory.deploy('Test ERC20', 'T20', initialSupply, owner)
  return { erc20 }
}

const printContractAddresses = ({ erc20 }) => {
  console.log('ERC20 address:', erc20.address)
}

async function main() {
  const [deployer] = await ethers.getSigners()
  const network = await ethers.provider.getNetwork()

  console.log(
    `Deploying contracts to ${network.name} (${network.chainId}) with account: ${deployer.address}`,
    deployer.address,
  )

  console.log('Account balance:', (await deployer.getBalance()).toString())

  const factories = await getFactories()

  // Do something different for local development
  if (network.chainId === 1337) {
    const { erc20 } = await deployToken(factories.erc20Factory, deployer.address)
    printContractAddresses({ erc20 })
  } else if (network.chainId === 3) {
    // Ropsten testnet

    const { erc20 } = await deployToken(factories.erc20Factory, deployer.address)
    printContractAddresses({ erc20 })
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
