import fetch from 'node-fetch'
import { SlmChargeback } from '@solomon/shared/util-contract'
import { envStore } from '@solomon/blockchain-watcher/feature-app'
import { PaymentCreatedEvent } from '../Klass/PaymentCreatedEvent'
import { stringHelper } from '../helper/stringHelper'
import { EnumPaymentCreatedEventType } from '../Enum/EnumPaymentCreatedEventType'

export class DeliverService {
  async sendChargebackEvent(slmChargeback: SlmChargeback) {
    const party1 = await slmChargeback.buyer()
    const party2 = await slmChargeback.merchant()
    const judge = await slmChargeback.judge()
    const token = await slmChargeback.token()
    const discount = await slmChargeback.discount()

    const event = new PaymentCreatedEvent({
      type: EnumPaymentCreatedEventType.chargeback,
      party1: party1,
      party2: party2,
      contract: '', //todo
      judgeContract: judge,
      token: token,
      discount: discount,
      ethPaid: 0, // todo
    })

    const body = JSON.stringify(event)
    const signature = stringHelper.generateDisputeApiSignature(
      envStore.disputeApiSecretKey,
      body,
    )

    await fetch(`${envStore.disputeApiUrl}/api/event`, {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
        'X-Signature': signature,
      },
      body: body,
    })
  }

  async sendPreorderEvent() {}

  async sendEscrowEvent() {}

  async init() {}
}

export const deliverService = new DeliverService()
