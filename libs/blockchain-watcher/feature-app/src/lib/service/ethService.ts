import { ethers, Wallet } from 'ethers'
import { mailService } from './mailService'
import { envStore } from '../store/envStore'
import {
  SlmChargeback__factory,
  SlmEscrow__factory,
  SlmFactory,
  SlmFactory__factory,
  SlmPreorder__factory,
} from '@solomon/shared/util-contract'
import { JsonRpcProvider } from '@ethersproject/providers'
import { deliverService } from './deliverService'
import { dbService } from './dbService'
import { loggerService } from '@monorepo/shared/util-logger'

export class EthService {
  provider: JsonRpcProvider | null = null
  wallet: Wallet | null = null
  contract: SlmFactory | null = null

  async onChargebackCreated(chargebackAddress: string) {
    if (!this.wallet) {
      throw 'Wallet is not defined.'
    }

    try {
      let slmChargeback = await SlmChargeback__factory.connect(
        chargebackAddress,
        this.wallet,
      )

      await deliverService.sendChargebackEvent(slmChargeback)
      await mailService.sendChargebackCreatedEmail(slmChargeback)
    } catch (err) {
      loggerService.error(err)
    }
  }

  async onPreorderCreated(preorderAddress: string) {
    if (!this.wallet) {
      throw 'Wallet is not defined.'
    }

    try {
      let slmPreorder = await SlmPreorder__factory.connect(preorderAddress, this.wallet)

      await deliverService.sendPreorderEvent(slmPreorder)
      await mailService.sendPreorderCreatedEmail(slmPreorder)
    } catch (err) {
      loggerService.error(err)
    }
  }

  async onEscrowCreated(escrowAddress: string) {
    if (!this.wallet) {
      throw 'Wallet is not defined.'
    }

    try {
      let slmEscrow = await SlmEscrow__factory.connect(escrowAddress, this.wallet)

      await deliverService.sendEscrowEvent(slmEscrow)
      await mailService.sendEscrowCreatedEmail(slmEscrow)
    } catch (err) {
      loggerService.error(err)
    }
  }

  async getChargebackCreatedLogs(fromBlockHash?: string) {
    if (!this.contract) {
      throw 'Contract is not defined.'
    }

    try {
      let eventFilter = this.contract.filters.ChargebackCreated()
      let events = await this.contract.queryFilter(eventFilter, fromBlockHash)

      await dbService.setLastScanned(events[events.length - 1].blockHash)

      return events
    } catch (err) {
      loggerService.error(err)
      return []
    }
  }

  async getPreorderCreatedLogs(fromBlockHash?: string) {
    if (!this.contract) {
      throw 'Contract is not defined.'
    }

    try {
      let eventFilter = this.contract.filters.PreorderCreated()
      let events = await this.contract.queryFilter(eventFilter, fromBlockHash)

      await dbService.setLastScanned(events[events.length - 1].blockHash)

      return events
    } catch (err) {
      loggerService.error(err)
      return []
    }
  }

  async getEscrowCreatedLogs(fromBlockHash?: string) {
    if (!this.contract) {
      throw 'Contract is not defined.'
    }

    try {
      let eventFilter = this.contract.filters.EscrowCreated()
      let events = await this.contract.queryFilter(eventFilter, fromBlockHash)

      await dbService.setLastScanned(events[events.length - 1].blockHash)

      return events
    } catch (err) {
      loggerService.error(err)
      return []
    }
  }

  async start() {
    if (!this.contract) {
      throw 'Contract is not defined.'
    }

    this.contract.on('ChargebackCreated', this.onChargebackCreated)
    this.contract.on('PreorderCreated', this.onPreorderCreated)
    this.contract.on('EscrowCreated', this.onEscrowCreated)
  }

  async stop() {
    if (!this.contract) {
      throw 'Contract is not defined.'
    }

    this.contract.off('ChargebackCreated', this.onChargebackCreated)
    this.contract.off('PreorderCreated', this.onPreorderCreated)
    this.contract.off('EscrowCreated', this.onEscrowCreated)
  }

  async init() {
    let provider = new ethers.providers.JsonRpcProvider(envStore.ethNetworkUrl)
    let wallet = ethers.Wallet.fromMnemonic(envStore.walletMnemonic)
    let contract = SlmFactory__factory.connect(envStore.contractAddress, wallet)

    this.provider = provider
    this.wallet = wallet
    this.contract = contract
  }
}

export const ethService = new EthService()
