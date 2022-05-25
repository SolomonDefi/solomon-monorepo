import { IPaymentCreatedEvent } from '@solomon/shared/util-interface'
import { IsEnum, IsNumber, IsNumberString, IsString, Max, Min } from 'class-validator'
import { v4 } from 'uuid'
import { EnumEventType } from '@solomon/shared/util-enum'
import { IsEthAddress, IsPositiveNumericString } from '@solomon/shared/util-validator'

export class PaymentCreatedEventDto implements IPaymentCreatedEvent {
  @IsString()
  id: string = v4()

  @IsEnum(EnumEventType)
  readonly type: EnumEventType = EnumEventType.preorderPaymentCreated

  @IsEthAddress()
  party1: string = ''

  @IsEthAddress()
  party2: string = ''

  @IsEthAddress()
  contract: string = ''

  @IsEthAddress()
  judgeContract: string = ''

  @IsNumber()
  @Max(100)
  @Min(0)
  discount: number = 0

  @IsPositiveNumericString()
  ethPaid: string = ''

  @IsEthAddress()
  token: string = ''

  constructor(props: Partial<PaymentCreatedEventDto>) {
    for (let key of Object.keys(props)) {
      if (typeof this[key] !== 'undefined') {
        this[key] = props[key]
      }
    }
  }
}
