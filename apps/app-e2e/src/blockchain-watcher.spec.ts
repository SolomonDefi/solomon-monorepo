import {
  deliverService,
  DeliverService,
  ethService,
  EthService,
  mailService,
  MailService,
  watcherService,
} from '@solomon/blockchain-watcher/feature-app'
// todo: refactor as a nx lib
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { deployContracts } from '../../contracts/src/tests/testing'
import hardhat from 'hardhat'
import { SlmFactory } from '@solomon/shared/util-contract'
import { Contract } from 'ethers'

describe('blockchain-watcher', () => {
  // the contract methods with real blockchain are not so fast
  jest.setTimeout(60 * 1000)

  const ethers = hardhat['ethers']
  const TIMEOUT = 5 * 1000
  const TRANSFER_AMOUNT = 100

  // fixme: should not be "any" type, but there is an error when using "SignerWithAddress" type
  let owner: any = null
  let buyer: any = null
  let merchant: any = null
  let token: Contract = null
  let manager: Contract = null
  let storage: Contract = null
  let jurors: Contract = null
  let slmFactory: SlmFactory = null
  let originChargebackCreated = ethService.onChargebackCreated
  let originPreorderCreated = ethService.onPreorderCreated
  let originEscrowCreated = ethService.onEscrowCreated
  let originSendChargebackCreatedEmail = mailService.sendChargebackCreatedEmail
  let originSendPreorderCreatedEmail = mailService.sendPreorderCreatedEmail
  let originSendEscrowCreatedEmail = mailService.sendEscrowCreatedEmail
  let originSendChargebackEvent = deliverService.sendChargebackEvent
  let originSendPreorderEvent = deliverService.sendPreorderEvent
  let originSendEscrowEvent = deliverService.sendEscrowEvent

  beforeEach(async () => {
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
    await ethService.testInit(ethers.provider, slmFactory)
    // Will error if it's not deployed
    await ethService.contract.deployed()
  })

  afterEach(async () => {
    ethService.onChargebackCreated = originChargebackCreated
    ethService.onPreorderCreated = originPreorderCreated
    ethService.onEscrowCreated = originEscrowCreated
    mailService.sendChargebackCreatedEmail = originSendChargebackCreatedEmail
    mailService.sendPreorderCreatedEmail = originSendPreorderCreatedEmail
    mailService.sendEscrowCreatedEmail = originSendEscrowCreatedEmail
    deliverService.sendChargebackEvent = originSendChargebackEvent
    deliverService.sendPreorderEvent = originSendPreorderEvent
    deliverService.sendEscrowEvent = originSendEscrowEvent
    await watcherService.stop()
  })

  it('onChargebackCreated() triggered', async () => {
    const mockedChargebackCreated = jest.fn()
    const mockedPreorderCreated = jest.fn()
    const mockedEscrowCreated = jest.fn()
    ethService.onChargebackCreated = mockedChargebackCreated
    ethService.onPreorderCreated = mockedPreorderCreated
    ethService.onEscrowCreated = mockedEscrowCreated
    await ethService.start()

    expect(mockedChargebackCreated.mock.calls.length).toEqual(0)
    expect(mockedPreorderCreated.mock.calls.length).toEqual(0)
    expect(mockedEscrowCreated.mock.calls.length).toEqual(0)

    // Create an allowance for transfer of funds into dispute contract
    await token.approve(ethService.contract.address, TRANSFER_AMOUNT)

    // Deploy chargeback contract
    await ethService.contract.createChargeback(
      1,
      merchant.address,
      buyer.address,
      token.address,
    )

    // There is a delay between function trigger and event emit
    await new Promise((resolve) => {
      setTimeout(resolve, TIMEOUT)
    })

    expect(mockedChargebackCreated.mock.calls.length).toEqual(1)
    expect(mockedPreorderCreated.mock.calls.length).toEqual(0)
    expect(mockedEscrowCreated.mock.calls.length).toEqual(0)
  })

  it('onChargebackCreated() inside action triggered', async () => {
    const mockedSendChargebackEvent = jest.fn()
    const mockedSendChargebackCreatedEmail = jest.fn()
    deliverService.sendChargebackEvent = mockedSendChargebackEvent
    mailService.sendChargebackCreatedEmail = mockedSendChargebackCreatedEmail
    await ethService.start()

    expect(mockedSendChargebackEvent.mock.calls.length).toEqual(0)
    expect(mockedSendChargebackCreatedEmail.mock.calls.length).toEqual(0)

    // Create an allowance for transfer of funds into dispute contract
    await token.approve(ethService.contract.address, TRANSFER_AMOUNT)

    // Deploy chargeback contract
    await ethService.contract.createChargeback(
      1,
      merchant.address,
      buyer.address,
      token.address,
    )

    // There is a delay between function trigger and event emit
    await new Promise((resolve) => {
      setTimeout(resolve, TIMEOUT)
    })

    expect(mockedSendChargebackEvent.mock.calls.length).toEqual(1)
    expect(mockedSendChargebackCreatedEmail.mock.calls.length).toEqual(1)
  })

  it('onPreorderCreated()', async () => {
    const mockedChargebackCreated = jest.fn()
    const mockedPreorderCreated = jest.fn()
    const mockedEscrowCreated = jest.fn()
    ethService.onChargebackCreated = mockedChargebackCreated
    ethService.onPreorderCreated = mockedPreorderCreated
    ethService.onEscrowCreated = mockedEscrowCreated
    await ethService.start()

    expect(mockedChargebackCreated.mock.calls.length).toEqual(0)
    expect(mockedPreorderCreated.mock.calls.length).toEqual(0)
    expect(mockedEscrowCreated.mock.calls.length).toEqual(0)

    // Create an allowance for transfer of funds into dispute contract
    await token.approve(ethService.contract.address, TRANSFER_AMOUNT)

    // Deploy dispute contract
    await ethService.contract.createPreorder(
      2,
      merchant.address,
      buyer.address,
      token.address,
    )

    // There is a delay between function trigger and event emit
    await new Promise((resolve) => {
      setTimeout(resolve, TIMEOUT)
    })

    expect(mockedChargebackCreated.mock.calls.length).toEqual(0)
    expect(mockedPreorderCreated.mock.calls.length).toEqual(1)
    expect(mockedEscrowCreated.mock.calls.length).toEqual(0)
  })

  it('onPreorderCreated() inside action triggered', async () => {
    const mockedSendPreorderEvent = jest.fn()
    const mockedSendPreorderCreatedEmail = jest.fn()
    deliverService.sendPreorderEvent = mockedSendPreorderEvent
    mailService.sendPreorderCreatedEmail = mockedSendPreorderCreatedEmail
    await ethService.start()

    expect(mockedSendPreorderEvent.mock.calls.length).toEqual(0)
    expect(mockedSendPreorderCreatedEmail.mock.calls.length).toEqual(0)

    // Create an allowance for transfer of funds into dispute contract
    await token.approve(ethService.contract.address, TRANSFER_AMOUNT)

    // Deploy dispute contract
    await ethService.contract.createPreorder(
      2,
      merchant.address,
      buyer.address,
      token.address,
    )

    // There is a delay between function trigger and event emit
    await new Promise((resolve) => {
      setTimeout(resolve, TIMEOUT)
    })

    expect(mockedSendPreorderEvent.mock.calls.length).toEqual(1)
    expect(mockedSendPreorderCreatedEmail.mock.calls.length).toEqual(1)
  })

  it('onEscrowCreated()', async () => {
    const mockedChargebackCreated = jest.fn()
    const mockedPreorderCreated = jest.fn()
    const mockedEscrowCreated = jest.fn()
    ethService.onChargebackCreated = mockedChargebackCreated
    ethService.onPreorderCreated = mockedPreorderCreated
    ethService.onEscrowCreated = mockedEscrowCreated
    await ethService.start()

    expect(mockedChargebackCreated.mock.calls.length).toEqual(0)
    expect(mockedPreorderCreated.mock.calls.length).toEqual(0)
    expect(mockedEscrowCreated.mock.calls.length).toEqual(0)

    // Create an allowance for transfer of funds into dispute contract
    await token.approve(ethService.contract.address, TRANSFER_AMOUNT)

    // Deploy dispute contract
    await ethService.contract.createEscrow(
      3,
      merchant.address,
      buyer.address,
      token.address,
    )

    // There is a delay between function trigger and event emit
    await new Promise((resolve) => {
      setTimeout(resolve, TIMEOUT)
    })

    expect(mockedChargebackCreated.mock.calls.length).toEqual(0)
    expect(mockedPreorderCreated.mock.calls.length).toEqual(0)
    expect(mockedEscrowCreated.mock.calls.length).toEqual(1)
  })

  it('onEscrowCreated() inside action triggered', async () => {
    const mockedSendEscrowEvent = jest.fn()
    const mockedSendEscrowCreatedEmail = jest.fn()
    deliverService.sendEscrowEvent = mockedSendEscrowEvent
    mailService.sendEscrowCreatedEmail = mockedSendEscrowCreatedEmail
    await ethService.start()

    expect(mockedSendEscrowEvent.mock.calls.length).toEqual(0)
    expect(mockedSendEscrowCreatedEmail.mock.calls.length).toEqual(0)

    // Create an allowance for transfer of funds into dispute contract
    await token.approve(ethService.contract.address, TRANSFER_AMOUNT)

    // Deploy chargeback contract
    await ethService.contract.createEscrow(
      3,
      merchant.address,
      buyer.address,
      token.address,
    )

    // There is a delay between function trigger and event emit
    await new Promise((resolve) => {
      setTimeout(resolve, TIMEOUT)
    })

    expect(mockedSendEscrowEvent.mock.calls.length).toEqual(1)
    expect(mockedSendEscrowCreatedEmail.mock.calls.length).toEqual(1)
  })

  it('start()', async () => {
    const mockedChargebackCreated = jest.fn()
    const mockedPreorderCreated = jest.fn()
    const mockedEscrowCreated = jest.fn()
    ethService.onChargebackCreated = mockedChargebackCreated
    ethService.onPreorderCreated = mockedPreorderCreated
    ethService.onEscrowCreated = mockedEscrowCreated
    // await ethService.start()

    expect(mockedChargebackCreated.mock.calls.length).toEqual(0)
    expect(mockedPreorderCreated.mock.calls.length).toEqual(0)
    expect(mockedEscrowCreated.mock.calls.length).toEqual(0)

    // Create an allowance for transfer of funds into dispute contract
    await token.approve(ethService.contract.address, TRANSFER_AMOUNT)
    await ethService.contract.createChargeback(
      1,
      merchant.address,
      buyer.address,
      token.address,
    )

    await token.approve(ethService.contract.address, TRANSFER_AMOUNT)
    await ethService.contract.createPreorder(
      2,
      merchant.address,
      buyer.address,
      token.address,
    )

    await token.approve(ethService.contract.address, TRANSFER_AMOUNT)
    await ethService.contract.createEscrow(
      3,
      merchant.address,
      buyer.address,
      token.address,
    )

    await new Promise((resolve) => {
      setTimeout(resolve, TIMEOUT)
    })

    expect(mockedChargebackCreated.mock.calls.length).toEqual(0)
    expect(mockedPreorderCreated.mock.calls.length).toEqual(0)
    expect(mockedEscrowCreated.mock.calls.length).toEqual(0)
  })

  it('stop()', async () => {
    const mockedChargebackCreated = jest.fn()
    const mockedPreorderCreated = jest.fn()
    const mockedEscrowCreated = jest.fn()
    ethService.onChargebackCreated = mockedChargebackCreated
    ethService.onPreorderCreated = mockedPreorderCreated
    ethService.onEscrowCreated = mockedEscrowCreated
    await ethService.start()

    await ethService.stop()

    expect(mockedChargebackCreated.mock.calls.length).toEqual(0)
    expect(mockedPreorderCreated.mock.calls.length).toEqual(0)
    expect(mockedEscrowCreated.mock.calls.length).toEqual(0)

    // Create an allowance for transfer of funds into dispute contract
    await token.approve(ethService.contract.address, TRANSFER_AMOUNT)
    await ethService.contract.createChargeback(
      1,
      merchant.address,
      buyer.address,
      token.address,
    )

    await token.approve(ethService.contract.address, TRANSFER_AMOUNT)
    await ethService.contract.createPreorder(
      2,
      merchant.address,
      buyer.address,
      token.address,
    )

    await token.approve(ethService.contract.address, TRANSFER_AMOUNT)
    await ethService.contract.createEscrow(
      3,
      merchant.address,
      buyer.address,
      token.address,
    )

    await new Promise((resolve) => {
      setTimeout(resolve, TIMEOUT)
    })

    expect(mockedChargebackCreated.mock.calls.length).toEqual(0)
    expect(mockedPreorderCreated.mock.calls.length).toEqual(0)
    expect(mockedEscrowCreated.mock.calls.length).toEqual(0)
  })

  it('getChargebackCreatedLogs()', async () => {
    await token.approve(ethService.contract.address, TRANSFER_AMOUNT)
    await ethService.contract.createChargeback(
      0,
      merchant.address,
      buyer.address,
      token.address,
    )

    let events = await ethService.getChargebackCreatedLogs()

    expect(events.length).toEqual(1)

    await token.approve(ethService.contract.address, TRANSFER_AMOUNT)
    await ethService.contract.createChargeback(
      1,
      merchant.address,
      buyer.address,
      token.address,
    )

    events = await ethService.getChargebackCreatedLogs()

    expect(events.length).toEqual(2)
  })

  it('getPreorderCreatedLogs()', async () => {
    await token.approve(ethService.contract.address, TRANSFER_AMOUNT)
    await ethService.contract.createPreorder(
      0,
      merchant.address,
      buyer.address,
      token.address,
    )

    let events = await ethService.getPreorderCreatedLogs()

    expect(events.length).toEqual(1)

    await token.approve(ethService.contract.address, TRANSFER_AMOUNT)
    await ethService.contract.createPreorder(
      1,
      merchant.address,
      buyer.address,
      token.address,
    )

    events = await ethService.getPreorderCreatedLogs()

    expect(events.length).toEqual(2)
  })

  it('getEscrowCreatedLogs()', async () => {
    await token.approve(ethService.contract.address, TRANSFER_AMOUNT)
    await ethService.contract.createEscrow(
      0,
      merchant.address,
      buyer.address,
      token.address,
    )

    let events = await ethService.getEscrowCreatedLogs()

    expect(events.length).toEqual(1)

    await token.approve(ethService.contract.address, TRANSFER_AMOUNT)
    await ethService.contract.createEscrow(
      1,
      merchant.address,
      buyer.address,
      token.address,
    )

    events = await ethService.getEscrowCreatedLogs()

    expect(events.length).toEqual(2)
  })
})
