import { ethers } from 'ethers'
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
import { loggerService } from '@solomon/shared/util-logger'

export class EthService {
  provider: JsonRpcProvider
  contract: SlmFactory | undefined = undefined

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(envStore.ethNetworkUrl)
  }

  onChargebackCreated = async (chargebackAddress: string) => {
    try {
      let slmChargeback = await SlmChargeback__factory.connect(
        chargebackAddress,
        this.provider,
      )

      await deliverService.sendChargebackEvent(slmChargeback)
      await mailService.sendChargebackCreatedEmail(slmChargeback)
    } catch (err) {
      loggerService.error(err)
    }
  }

  onPreorderCreated = async (preorderAddress: string) => {
    try {
      let slmPreorder = await SlmPreorder__factory.connect(preorderAddress, this.provider)

      await deliverService.sendPreorderEvent(slmPreorder)
      await mailService.sendPreorderCreatedEmail(slmPreorder)
    } catch (err) {
      loggerService.error(err)
    }
  }

  onEscrowCreated = async (escrowAddress: string) => {
    try {
      let slmEscrow = await SlmEscrow__factory.connect(escrowAddress, this.provider)

      await deliverService.sendEscrowEvent(slmEscrow)
      await mailService.sendEscrowCreatedEmail(slmEscrow)
    } catch (err) {
      loggerService.error(err)
    }
  }

  getChargebackCreatedLogs = async (fromBlockHash?: string) => {
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

  getPreorderCreatedLogs = async (fromBlockHash?: string) => {
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

  getEscrowCreatedLogs = async (fromBlockHash?: string) => {
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

  start = async () => {
    if (!this.contract) {
      throw 'Contract is not defined.'
    }

    this.contract.on('ChargebackCreated', this.onChargebackCreated)
    this.contract.on('PreorderCreated', this.onPreorderCreated)
    this.contract.on('EscrowCreated', this.onEscrowCreated)
  }

  stop = async () => {
    if (!this.contract) {
      throw 'Contract is not defined.'
    }

    this.contract.off('ChargebackCreated', this.onChargebackCreated)
    this.contract.off('PreorderCreated', this.onPreorderCreated)
    this.contract.off('EscrowCreated', this.onEscrowCreated)
  }

  init = async () => {
    let contract = SlmFactory__factory.connect(envStore.contractAddress, this.provider)

    this.contract = contract
  }

  testInit = async (provider: JsonRpcProvider, contract: SlmFactory) => {
    this.provider = provider
    this.contract = contract
  }
}

export const ethService = new EthService()
