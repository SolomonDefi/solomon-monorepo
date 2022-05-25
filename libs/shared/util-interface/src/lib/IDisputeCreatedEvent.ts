import { IBaseEvent } from './IBaseEvent'

export interface IDisputeCreatedEvent extends IBaseEvent {
  judgeContract: string
}
