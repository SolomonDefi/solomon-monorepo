import fetch from 'node-fetch'
import { SlmChargeback, SlmEscrow, SlmPreorder } from '@solomon/shared/util-contract'
import { PaymentCreatedEvent } from '../Klass/PaymentCreatedEvent'
import { PaymentCreatedEventType } from '../Enum/PaymentCreatedEventType'
import { envStore } from '@solomon/shared/store-env'
import { stringHelper } from '@solomon/shared/util-helper'

export class DeliverService {
  async sendEventToDisputeApi(event: PaymentCreatedEvent) {
    const body = JSON.stringify(event)
    const signature = stringHelper.generateApiSignature(
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

  async sendChargebackEvent(slmChargeback: SlmChargeback) {
    const party1 = await slmChargeback.buyer()
    const party2 = await slmChargeback.merchant()
    const judge = await slmChargeback.judge()
    const token = await slmChargeback.token()
    const discount = await slmChargeback.discount()

    const event = new PaymentCreatedEvent({
      type: PaymentCreatedEventType.chargeback,
      party1: party1,
      party2: party2,
      contract: '', // todo
      judgeContract: judge,
      token: token,
      discount: discount,
      ethPaid: '', // todo
    })

    await this.sendEventToDisputeApi(event)
  }

  async sendPreorderEvent(slmPreorder: SlmPreorder) {
    const party1 = await slmPreorder.buyer()
    const party2 = await slmPreorder.merchant()
    const judge = await slmPreorder.judge()
    const token = await slmPreorder.token()
    const discount = await slmPreorder.discount()

    const event = new PaymentCreatedEvent({
      type: PaymentCreatedEventType.preorder,
      party1: party1,
      party2: party2,
      contract: envStore.contractAddress,
      judgeContract: judge,
      token: token,
      discount: discount,
      ethPaid: '1', // todo
    })

    await this.sendEventToDisputeApi(event)
  }

  async sendEscrowEvent(slmEscrow: SlmEscrow) {
    const party1 = await slmEscrow.party1()
    const party2 = await slmEscrow.party2()
    const judge = await slmEscrow.judge()
    const token = await slmEscrow.token()

    const event = new PaymentCreatedEvent({
      type: PaymentCreatedEventType.escrow,
      party1: party1,
      party2: party2,
      contract: '', // todo
      judgeContract: judge,
      token: token,
      discount: 0, // todo
      ethPaid: '', // todo
    })

    await this.sendEventToDisputeApi(event)
  }

  async init() {}
}

export const deliverService = new DeliverService()
