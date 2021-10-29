import { EnumPaymentCreatedEventType } from '../Enum/EnumPaymentCreatedEventType'
import { v4 } from 'uuid'

export class PaymentCreatedEvent {
  id: string = v4()
  type: EnumPaymentCreatedEventType = EnumPaymentCreatedEventType.unknown
  party1: string = ''
  party2: string = ''
  contract: string = ''
  judgeContract: string = ''
  token: string = ''
  discount: number = 0
  ethPaid: number = 0

  constructor(props: Partial<PaymentCreatedEvent>) {
    Object.assign(this, props)

    if (this.type === EnumPaymentCreatedEventType.unknown) {
      throw 'type can not be unknown'
    }

    if (this.discount < 0 || this.discount > 100) {
      throw 'discount must between 0-100'
    }
  }
}
