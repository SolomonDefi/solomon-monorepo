import { EnumEventType } from '@solomon/shared/util-enum'
import { DisputeCreatedEventDto } from './DisputeCreatedEventDto'
import { PaymentCreatedEventDto } from './PaymentCreatedEventDto'
import { DisputeCompleteEventDto } from './DisputeCompleteEventDto'
import { EvidenceSubmittedEventDto } from './EvidenceSubmittedEventDto'
import { TEventDto } from './TEventDto'

export class KlassHelper {
  generateEventDto = (event: unknown): TEventDto => {
    switch (event['type']) {
      case EnumEventType.preorderDisputeCreated:
        return new DisputeCreatedEventDto(event)
      case EnumEventType.preorderDisputeComplete:
        return new DisputeCompleteEventDto(event)
      case EnumEventType.preorderEvidenceSubmitted:
        return new EvidenceSubmittedEventDto(event)
      case EnumEventType.preorderPaymentCreated:
        return new PaymentCreatedEventDto(event)
    }

    throw 'Unknown event type'
  }
}

export const klassHelper = new KlassHelper()
