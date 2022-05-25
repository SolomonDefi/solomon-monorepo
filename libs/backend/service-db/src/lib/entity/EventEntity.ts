import {
  IDisputeCompleteEvent,
  IDisputeCreatedEvent,
  IEvidenceSubmittedEvent,
  IPaymentCreatedEvent,
} from '@solomon/shared/util-interface'
import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { EnumEventType } from '@solomon/shared/util-enum'
import { v4 } from 'uuid'

@Entity({
  tableName: 'event',
})
export class EventEntity
  implements
    IDisputeCompleteEvent,
    IDisputeCreatedEvent,
    IEvidenceSubmittedEvent,
    IPaymentCreatedEvent
{
  @PrimaryKey()
  id: string = v4()

  @Property({
    nullable: true,
  })
  type: EnumEventType = null

  @Property()
  party1: string = ''

  @Property()
  party2: string = ''

  @Property()
  contract: string = ''

  @Property({
    nullable: true,
  })
  judgeContract: string = null

  @Property({
    nullable: true,
  })
  awardedTo: string = null

  @Property({
    nullable: true,
  })
  evidenceUrl: string = null

  @Property({
    nullable: true,
  })
  submitter: string = null

  @Property({
    nullable: true,
  })
  token: string = null

  @Property({
    nullable: true,
  })
  discount: number = null

  @Property({
    nullable: true,
  })
  ethPaid: string = null

  @Property({
    nullable: true,
  })
  createDate: Date = null
}
