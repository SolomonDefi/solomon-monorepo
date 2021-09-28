import { ethers } from 'ethers'
import envStore from '../store/envStore'
import mailService from './mailService'
import { SlmFactory, SlmFactory__factory } from '../../../_temp-contract/typechain'

export class EthService {
  provider: ethers.providers.JsonRpcProvider = null as any
  contract: SlmFactory = null as any

  async onChargebackCreated() {
    // TODO: Process event
    await mailService.sendChargebackCreatedEmail('A')
    await mailService.sendChargebackCreatedEmail('B')
  }

  async onPreorderCreated() {
    // TODO: Process event
    await mailService.sendPreorderCreatedEmail('A')
    await mailService.sendPreorderCreatedEmail('B')
  }

  async onEscrowCreated() {
    // TODO: Process event
    await mailService.sendEscrowCreatedEmail('A')
    await mailService.sendEscrowCreatedEmail('B')
  }

  async getChargebackCreatedLogs() {
    let eventFilter = this.contract.filters.ChargebackCreated()
    let events = this.contract.queryFilter(eventFilter)

    // TODO: save last event block hash

    return events
  }

  async getPreorderCreatedLogs() {
    let eventFilter = this.contract.filters.PreorderCreated()
    let events = this.contract.queryFilter(eventFilter)

    // TODO: save last event block hash

    return events
  }

  async getEscrowCreatedLogs() {
    let eventFilter = this.contract.filters.EscrowCreated()
    let events = this.contract.queryFilter(eventFilter)

    // TODO: save last event block hash

    return events
  }

  async init() {
    this.provider = new ethers.providers.JsonRpcProvider(envStore.ethChainUrl)
    this.contract = SlmFactory__factory.connect(envStore.factoryAddress, this.provider)

    this.contract.on('ChargebackCreated', this.onChargebackCreated)
    this.contract.on('PreorderCreated', this.onPreorderCreated)
    this.contract.on('EscrowCreated', this.onEscrowCreated)
  }
}

export default new EthService()
