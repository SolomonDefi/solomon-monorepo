import {ethers} from "ethers";
import envStore from "../store/envStore";
import mailService from "./mailService";

export class EthService {

  provider = new ethers.providers.JsonRpcProvider(envStore.ethChainUrl)

  // TODO: Replace with contract factory from TypeContract
  contract = new ethers.Contract('', '', this.provider)

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

  async init() {
    this.contract.connect(this.provider)
    this.contract.on("ChargebackCreated", this.onChargebackCreated)
    this.contract.on("PreorderCreated", this.onPreorderCreated)
    this.contract.on("EscrowCreated", this.onEscrowCreated)
  }
}

export default new EthService()
