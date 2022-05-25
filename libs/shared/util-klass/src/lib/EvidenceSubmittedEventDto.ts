import { IEvidenceSubmittedEvent } from '@solomon/shared/util-interface'
import { IsEnum, IsString, IsUrl } from 'class-validator'
import { v4 } from 'uuid'
import { EnumEventType } from '@solomon/shared/util-enum'
import { IsEthAddress } from '@solomon/shared/util-validator'

export class EvidenceSubmittedEventDto implements IEvidenceSubmittedEvent {
  @IsString()
  id: string = v4()

  @IsEnum(EnumEventType)
  readonly type: EnumEventType = EnumEventType.preorderEvidenceSubmitted

  @IsEthAddress()
  party1: string = ''

  @IsEthAddress()
  party2: string = ''

  @IsEthAddress()
  contract: string = ''

  @IsEthAddress()
  judgeContract: string = ''

  @IsUrl()
  evidenceUrl: string = ''

  @IsEthAddress()
  submitter: string = ''

  constructor(props: Partial<EvidenceSubmittedEventDto>) {
    for (let key of Object.keys(props)) {
      if (typeof this[key] !== 'undefined') {
        this[key] = props[key]
      }
    }
  }
}
