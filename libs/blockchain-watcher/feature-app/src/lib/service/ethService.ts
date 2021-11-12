import { ethers, Wallet } from "ethers";
import { mailService } from './mailService'
import { envStore } from '../store/envStore'
import {
  SlmChargeback__factory,
  SlmEscrow__factory,
  SlmFactory,
  SlmFactory__factory,
  SlmPreorder__factory,
} from '@solomon/shared/util-contract'
import { JsonRpcProvider, Provider } from "@ethersproject/providers";
import { deliverService } from './deliverService'

export class EthService {
  provider: JsonRpcProvider | null = null
  wallet: Wallet | null = null
  contract: SlmFactory | null = null

  async onChargebackCreated(chargebackAddress: string) {
    if (!this.provider) {
      throw 'Provider is not defined.'
    }

    let slmChargeback = await SlmChargeback__factory.connect(
      chargebackAddress,
      this.provider,
    )

    await deliverService.sendChargebackEvent(slmChargeback)
    await mailService.sendChargebackCreatedEmail(slmChargeback)
  }

  async onPreorderCreated(preorderAddress: string) {
    if (!this.provider) {
      throw 'Provider is not defined.'
    }

    let slmPreorder = await SlmPreorder__factory.connect(preorderAddress, this.provider)

    await deliverService.sendPreorderEvent(slmPreorder)
    await mailService.sendPreorderCreatedEmail(slmPreorder)
  }

  async onEscrowCreated(escrowAddress: string) {
    if (!this.provider) {
      throw 'Provider is not defined.'
    }

    let slmEscrow = await SlmEscrow__factory.connect(escrowAddress, this.provider)

    await deliverService.sendEscrowEvent(slmEscrow)
    await mailService.sendEscrowCreatedEmail(slmEscrow)
  }

  async getChargebackCreatedLogs() {
    if (!this.contract) {
      throw 'Contract is not defined.'
    }

    let eventFilter = this.contract.filters.ChargebackCreated()
    let events = await this.contract.queryFilter(eventFilter)

    // TODO: save last event block hash

    return events
  }

  async getPreorderCreatedLogs() {
    if (!this.contract) {
      throw 'Contract is not defined.'
    }

    let eventFilter = this.contract.filters.PreorderCreated()
    let events = await this.contract.queryFilter(eventFilter)

    // TODO: save last event block hash

    return events
  }

  async getEscrowCreatedLogs() {
    if (!this.contract) {
      throw 'Contract is not defined.'
    }

    let eventFilter = this.contract.filters.EscrowCreated()
    let events = await this.contract.queryFilter(eventFilter)

    // TODO: save last event block hash

    return events
  }

  async start() {
    this.contract.on('ChargebackCreated', this.onChargebackCreated)
    this.contract.on('PreorderCreated', this.onPreorderCreated)
    this.contract.on('EscrowCreated', this.onEscrowCreated)
  }

  async stop() {
    this.contract.off('ChargebackCreated', this.onChargebackCreated)
    this.contract.off('PreorderCreated', this.onPreorderCreated)
    this.contract.off('EscrowCreated', this.onEscrowCreated)
  }

  async init() {
    let provider = new ethers.providers.JsonRpcProvider(envStore.ethNetworkUrl)
    let wallet = new ethers.Wallet(envStore.walletPrivateKey, provider)
    let contract = SlmFactory__factory.connect(envStore.contractAddress, wallet)

    this.provider = provider
    this.wallet = wallet
    this.contract = contract

    this.contract.connect(this.provider)
  }
}

export const ethService = new EthService()
