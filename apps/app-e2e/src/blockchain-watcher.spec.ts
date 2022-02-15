import { ethService, watcherService } from '@solomon/blockchain-watcher/feature-app'
// todo: refactor as a nx lib
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { deployContracts } from '../../contracts/src/tests/testing'
import hardhat from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/src/signers'
import { SlmFactory } from '@solomon/shared/util-contract'
import { Contract } from 'ethers'
const ethers = hardhat['ethers']

describe('blockchain-watcher', () => {
  // the contract methods with real blockchain are not so fast
  jest.setTimeout(60 * 1000)

  let owner: SignerWithAddress = null
  let buyer: SignerWithAddress = null
  let merchant: SignerWithAddress = null
  let token: Contract = null
  let manager: Contract = null
  let storage: Contract = null
  let jurors: Contract = null
  let slmFactory: SlmFactory = null

  beforeAll(async () => {
    // Get hardhat addresses
    ;[owner, buyer, merchant] = await ethers.getSigners()

    // Deploy Solomon contracts
    // TODO: Rework deployments to match standards
    ;[token, manager, storage, jurors, slmFactory] = await deployContracts()

    // Allocate tokens to user wallets
    const defaultAmount = 10000000
    await token.mint(owner.address, defaultAmount)
    await token.mint(merchant.address, defaultAmount)
    await token.mint(buyer.address, defaultAmount)

    // Initialize services
    await watcherService.init()
    // Override for testing, need to point to hardhat provider, owner address, and deployed SlmFactory contract
    await ethService.testInit(ethers.provider, owner, slmFactory.address)

    // Will error if it's not deployed
    await ethService.contract.deployed()
  })

  afterAll(async () => {
    await ethService.stop()
  })

  it('onChargebackCreated()', async () => {
    const originFn = ethService.onChargebackCreated
    const mocked = jest.fn()
    ethService.onChargebackCreated = mocked
    await ethService.start()
    expect(mocked.mock.calls.length).toEqual(0)

    // Create an allowance for transfer of funds into dispute contract
    const transferAmount = 100
    await token.approve(ethService.contract.address, transferAmount)
    await ethService.start()

    // Deploy chargeback contract
    await ethService.contract.createChargeback(
      1,
      merchant.address,
      buyer.address,
      token.address,
    )

    // There is a delay between function trigger and event emit
    await new Promise((resolve) => {
      setTimeout(resolve, 20 * 1000)
    })

    expect(mocked.mock.calls.length).toEqual(1)
    ethService.onChargebackCreated = originFn
  })

  it('onPreorderCreated()', async () => {
    const originFn = ethService.onPreorderCreated
    const mocked = jest.fn()
    ethService.onPreorderCreated = mocked
    await ethService.start()
    expect(mocked.mock.calls.length).toEqual(0)

    // Create an allowance for transfer of funds into dispute contract
    const transferAmount = 100
    await token.approve(ethService.contract.address, transferAmount)

    // Deploy dispute contract
    await ethService.contract.createPreorder(
      2,
      merchant.address,
      buyer.address,
      token.address,
    )

    // There is a delay between function trigger and event emit
    await new Promise((resolve) => {
      setTimeout(resolve, 20 * 1000)
    })

    expect(mocked.mock.calls.length).toEqual(1)
    ethService.onPreorderCreated = originFn
  })

  it('onEscrowCreated()', async () => {
    const originFn = ethService.onEscrowCreated
    const mocked = jest.fn()
    ethService.onEscrowCreated = mocked
    await ethService.start()
    expect(mocked.mock.calls.length).toEqual(0)

    // Create an allowance for transfer of funds into dispute contract
    const transferAmount = 100
    await token.approve(ethService.contract.address, transferAmount)

    // Deploy dispute contract
    await ethService.contract.createEscrow(
      3,
      merchant.address,
      buyer.address,
      token.address,
    )

    // There is a delay between function trigger and event emit
    await new Promise((resolve) => {
      setTimeout(resolve, 20 * 1000)
    })

    expect(mocked.mock.calls.length).toEqual(1)
    ethService.onEscrowCreated = originFn
  })

  it('getChargebackCreatedLogs()', async () => {})

  it('getPreorderCreatedLogs()', async () => {})

  it('getEscrowCreatedLogs()', async () => {})
})
