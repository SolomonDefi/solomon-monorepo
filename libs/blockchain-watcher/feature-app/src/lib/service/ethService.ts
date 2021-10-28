import { ethers } from 'ethers'
import { mailService } from './mailService'
import { envStore } from '../store/envStore'
import {
  SlmChargeback__factory,
  SlmFactory,
  SlmFactory__factory,
} from '@solomon/shared/util-contract'
import { Provider } from '@ethersproject/providers'
import { deliverService } from './deliverService'

export class EthService {
  provider: Provider | null = null
  contract: SlmFactory | null = null

  async onChargebackCreated(chargebackAddress: string) {
    let slmChargeback = await SlmChargeback__factory.connect(
      chargebackAddress,
      this.provider,
    )

    await deliverService.sendChargebackEvent(slmChargeback)
    await mailService.sendChargebackCreatedEmail(slmChargeback)
  }

  async onPreorderCreated(preorderAddress: string) {
    // TODO: Process event
    await mailService.sendPreorderCreatedEmail('A')
    await mailService.sendPreorderCreatedEmail('B')
  }

  async onEscrowCreated(escrowAddress: string) {
    // TODO: Process event
    await mailService.sendEscrowCreatedEmail('A')
    await mailService.sendEscrowCreatedEmail('B')
  }

  async getChargebackCreatedLogs() {
    if (!this.contract) {
      return
    }

    let eventFilter = this.contract.filters.ChargebackCreated()
    let events = await this.contract.queryFilter(eventFilter)

    // TODO: save last event block hash

    return events
  }

  async getPreorderCreatedLogs() {
    if (!this.contract) {
      return
    }

    let eventFilter = this.contract.filters.PreorderCreated()
    let events = await this.contract.queryFilter(eventFilter)

    // TODO: save last event block hash

    return events
  }

  async getEscrowCreatedLogs() {
    if (!this.contract) {
      return
    }

    let eventFilter = this.contract.filters.EscrowCreated()
    let events = await this.contract.queryFilter(eventFilter)

    // TODO: save last event block hash

    return events
  }

  async init() {
    let provider = new ethers.providers.JsonRpcProvider(
      envStore.ethChainUrl,
    ) as unknown as Provider
    let contract = SlmFactory__factory.connect(envStore.contractAddress, provider)

    this.provider = provider
    this.contract = contract

    this.contract.connect(this.provider)
    this.contract.on('ChargebackCreated', this.onChargebackCreated)
    this.contract.on('PreorderCreated', this.onPreorderCreated)
    this.contract.on('EscrowCreated', this.onEscrowCreated)
  }
}

export const ethService = new EthService()
