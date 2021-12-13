import {
  deliverService,
  envStore,
  ethService,
  stringHelper,
  watcherService,
} from '@solomon/blockchain-watcher/feature-app'
import { deployContracts, deployPreorder } from '../../contracts/src/tests/testing'
import hardhat from 'hardhat'
const ethers = hardhat['ethers']
// import jest from 'jest'
import { v4 } from 'uuid'
import fetch, { Response } from 'node-fetch'

describe('blockchain-watcher', () => {
  jest.setTimeout(60 * 1000)

  let token, manager, storage, jurors, slmFactory, owner, buyer, merchant

  const doFetch = async (
    method: string,
    url: string,
    data: Record<string, unknown>,
  ): Promise<Response> => {
    const body = JSON.stringify(data)
    const signature = stringHelper.generateDisputeApiSignature(
      envStore.disputeApiSecretKey,
      body,
    )

    const fetched = await fetch(url, {
      method: method,
      headers: {
        'Content-type': 'application/json',
        'X-Signature': signature,
      },
      body: body,
    })

    return fetched
  }

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
    // For testing, need to point to hardhat provider, owner address, and deployed SlmFactory contract
    await ethService.testInit(ethers.provider, owner, slmFactory.address)
    await watcherService.start()

    // Will error if it's not deployed
    await ethService.contract.deployed()
  })

  afterAll(async () => {
    await watcherService.stop()
  })

  it('onChargebackCreated()', async () => {
    // Create an allowance for transfer of funds into dispute contract
    const transferAmount = 100
    await token.approve(ethService.contract.address, transferAmount)

    // Deploy dispute contract
    await ethService.contract.createChargeback(
      1,
      merchant.address,
      buyer.address,
      token.address,
    )

    // Get contract event logs from the dispute contract deployment
    await ethService.getChargebackCreatedLogs()
  })

  it('onPreorderCreated()', async () => {
    // const originFn = ethService.onPreorderCreated
    // const mocked = jest.fn()
    // ethService.onPreorderCreated = mocked
    // expect(mocked.mock.calls.length).toEqual(0)

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

    // Get contract event logs from the dispute contract deployment
    await ethService.getPreorderCreatedLogs()

    // expect(mocked.mock.calls.length).toEqual(1)
    // ethService.onPreorderCreated = originFn
  })

  it('onEscrowCreated()', async () => {
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

    // Get contract event logs from the dispute contract deployment
    await ethService.getEscrowCreatedLogs()
  })
})
