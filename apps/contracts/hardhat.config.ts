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
        count: 100,
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
    sources: 'src/contracts',
    tests: 'src/tests',
    cache: '../../dist/apps/contracts/cache',
    artifacts: '../../dist/apps/contracts/artifacts',
  },
}

export default config
