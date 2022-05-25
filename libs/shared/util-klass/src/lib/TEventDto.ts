import { PaymentCreatedEventDto } from './PaymentCreatedEventDto'
import { DisputeCompleteEventDto } from './DisputeCompleteEventDto'
import { EvidenceSubmittedEventDto } from './EvidenceSubmittedEventDto'
import { DisputeCreatedEventDto } from './DisputeCreatedEventDto'

export type TEventDto =
  | DisputeCompleteEventDto
  | DisputeCreatedEventDto
  | EvidenceSubmittedEventDto
  | PaymentCreatedEventDto
