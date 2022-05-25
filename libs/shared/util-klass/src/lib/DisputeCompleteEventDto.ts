import { IDisputeCompleteEvent } from '@solomon/shared/util-interface'
import { EnumEventType } from '@solomon/shared/util-enum'
import { IsEnum, IsString } from 'class-validator'
import { IsEthAddress } from '@solomon/shared/util-validator'
import { v4 } from 'uuid'

export class DisputeCompleteEventDto implements IDisputeCompleteEvent {
  @IsString()
  id: string = v4()

  @IsEnum(EnumEventType)
  readonly type: EnumEventType = EnumEventType.preorderDisputeComplete

  @IsEthAddress()
  party1: string = ''

  @IsEthAddress()
  party2: string = ''

  @IsEthAddress()
  contract: string = ''

  @IsEthAddress()
  awardedTo: string = ''

  @IsEthAddress()
  judgeContract: string = ''

  constructor(props: Partial<DisputeCompleteEventDto>) {
    for (let key of Object.keys(props)) {
      if (typeof this[key] !== 'undefined') {
        this[key] = props[key]
      }
    }
  }
}
