import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-solhint'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import 'hardhat-deploy'
import 'hardhat-gas-reporter'
import 'hardhat-contract-sizer'
import 'solidity-coverage'
import 'tsconfig-paths/register'
import { HardhatUserConfig } from 'hardhat/types'
import { task } from 'hardhat/config'
import { pathStore } from './libs/shared/util-path-store/src/index'

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

const walletMnemonic = process.env.WALLET_MNEMONIC || ''
const etherscanApiKey = process.env.ETHERSCAN_API_KEY || ''
const ropstenRpcUrl = process.env.ROPSTEN_RPC_URL || ''
const ropstenMnemonic = process.env.ROPSTEN_MNEMONIC || ''
const testReportGas = process.env.TEST_REPORT_GAS || '1'

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    // Hardhat dev Ethereum network node running on localhost
    hardhat: {
      chainId: 1337,
      accounts: {
        count: 10,
        mnemonic: walletMnemonic,
      },
      initialBaseFeePerGas: 0,
    },
    // Hardhat dev Ethereum network node running in local dev Kubernetes
    hardhatK8s: {
      chainId: 1337,
      accounts: {
        count: 100,
        mnemonic: walletMnemonic,
      },
      url: 'http://ethereum-node:8545',
    },
    ropsten: {
      chainId: 3,
      gas: 5000000,
      gasPrice: 50000000000,
      gasMultiplier: 1,
      timeout: 90000,
      url: ropstenRpcUrl,
      accounts: {
        mnemonic: ropstenMnemonic,
      },
    },
  },
  gasReporter: {
    enabled: testReportGas === '1',
    showMethodSig: true,
  },
  etherscan: {
    apiKey: etherscanApiKey,
  },
  solidity: {
    version: '0.8.9',
  },
  paths: {
    root: './',
    sources: './apps/contracts/src/contracts',
    tests: './apps/contracts/src/tests',
    cache: `${pathStore.root}/dist/apps/contracts/cache`,
    artifacts: `${pathStore.root}/dist/apps/contracts/artifacts`,
  },
  typechain: {
    outDir: `${pathStore.root}/libs/shared/util-contract/src`,
    target: 'ethers-v5',
  },
}

export default config
