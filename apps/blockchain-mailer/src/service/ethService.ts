import {ethers} from "ethers";
import envStore from "../store/envStore";
import mailService from "./mailService";

export class EthService {

  provider = null as any
  contract = null as any

  async onChargebackCreated() {
    // TODO: Process event
    await mailService.sendChargebackCreatedEmail("A")
    await mailService.sendChargebackCreatedEmail("B")
  }

  async onPreorderCreated() {
    // TODO: Process event
    await mailService.sendPreorderCreatedEmail("A")
    await mailService.sendPreorderCreatedEmail("B")
  }

  async onEscrowCreated() {
    // TODO: Process event
    await mailService.sendEscrowCreatedEmail("A")
    await mailService.sendEscrowCreatedEmail("B")
  }

  async getChargebackCreatedLogs() {
    // TODO: replace with typed method
    let eventFilter = this.contract.filters['ChargebackCreated']()
    let events = this.contract.queryFilter(eventFilter)

    return events
  }

  async getPreorderCreatedLogs() {
  // TODO: replace with typed method
    let eventFilter = this.contract.filters['PreorderCreated']()
    let events = this.contract.queryFilter(eventFilter)

    return events
  }

  async getEscrowCreatedLogs() {
    // TODO: replace with typed method
    let eventFilter = this.contract.filters['EscrowCreated']()
    let events = this.contract.queryFilter(eventFilter)

    return events
  }

  async init() {
    this.provider = new ethers.providers.JsonRpcProvider(envStore.ethChainUrl)
    // TODO: Replace with contract factory from TypeContract
    this.contract = new ethers.Contract('', '', this.provider)

    this.contract.connect(this.provider)
    this.contract.on("ChargebackCreated", this.onChargebackCreated)
    this.contract.on("PreorderCreated", this.onPreorderCreated)
    this.contract.on("EscrowCreated", this.onEscrowCreated)
  }
}

export default new EthService()
