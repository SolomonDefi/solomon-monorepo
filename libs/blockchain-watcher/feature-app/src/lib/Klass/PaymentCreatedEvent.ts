import { EnumPaymentCreatedEventType } from '../Enum/EnumPaymentCreatedEventType'
import { v4 } from 'uuid'

export class PaymentCreatedEvent {
  id: string = v4()
  type: EnumPaymentCreatedEventType
  party1: string
  party2: string
  contract: string
  judgeContract: string
  token: string
  discount: number
  ethPaid: number

  constructor(props: Partial<PaymentCreatedEvent>) {
    Object.assign(this, props)

    if (this.discount < 0 || this.discount > 100) {
      throw 'discount must between 0-100'
    }
  }
}
