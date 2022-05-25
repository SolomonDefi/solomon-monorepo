import { IBaseEvent } from './IBaseEvent'

export interface IEvidenceSubmittedEvent extends IBaseEvent {
  judgeContract: string
  evidenceUrl: string
  submitter: string
}
