import { IBaseEvent } from './IBaseEvent'

export interface IDisputeCompleteEvent extends IBaseEvent {
  judgeContract: string
  awardedTo: string
}
