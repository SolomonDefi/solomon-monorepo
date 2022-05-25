import {
  IDisputeCompleteEvent,
  IDisputeCreatedEvent,
  IEvidenceSubmittedEvent,
  IPaymentCreatedEvent,
} from '@solomon/shared/util-interface'

export type TEvent =
  | IDisputeCompleteEvent
  | IDisputeCreatedEvent
  | IEvidenceSubmittedEvent
  | IPaymentCreatedEvent
