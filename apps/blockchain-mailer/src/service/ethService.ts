import {ethers} from "ethers";
import envStore from "../store/envStore";
import mailService from "./mailService";

class EthService {

  provider = new ethers.providers.JsonRpcProvider(envStore.ethChainUrl)

  // TODO: Replace with contract factory from TypeContract
  contract = new ethers.Contract('', '', this.provider)

  async onChargebackCreated() {
    // TODO: Process event
    await mailService.sendContractEmail("", "")
  }

  async onPreorderCreated() {
    // TODO: Process event
    await mailService.sendContractEmail("", "")
  }

  async onEscrowCreated() {
    // TODO: Process event
    await mailService.sendContractEmail("", "")
  }

  async init() {
    this.contract.connect(this.provider)
    this.contract.on("ChargebackCreated", this.onChargebackCreated)
    this.contract.on("PreorderCreated", this.onPreorderCreated)
    this.contract.on("EscrowCreated", this.onEscrowCreated)
  }
}

export default new EthService()
