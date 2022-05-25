import { IBaseEvent } from './IBaseEvent'

export interface IPaymentCreatedEvent extends IBaseEvent {
  judgeContract: string
  token: string
  discount: number
  ethPaid: string
}
