import { IDisputeCreatedEvent } from '@solomon/shared/util-interface'
import { IsEnum, IsString } from 'class-validator'
import { v4 } from 'uuid'
import { EnumEventType } from '@solomon/shared/util-enum'
import { IsEthAddress } from '@solomon/shared/util-validator'

export class DisputeCreatedEventDto implements IDisputeCreatedEvent {
  @IsString()
  id: string = v4()

  @IsEnum(EnumEventType)
  readonly type: EnumEventType = EnumEventType.preorderDisputeCreated

  @IsEthAddress()
  party1: string = ''

  @IsEthAddress()
  party2: string = ''

  @IsEthAddress()
  contract: string = ''

  @IsEthAddress()
  judgeContract: string = ''

  constructor(props: Partial<DisputeCreatedEventDto>) {
    for (let key of Object.keys(props)) {
      if (typeof this[key] !== 'undefined') {
        this[key] = props[key]
      }
    }
  }
}
