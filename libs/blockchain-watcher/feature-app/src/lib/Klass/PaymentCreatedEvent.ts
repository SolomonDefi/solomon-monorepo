import { EnumPaymentCreatedEventType } from '../Enum/EnumPaymentCreatedEventType'
import { v4 } from 'uuid'
import { IsEnum, IsNotIn, IsNumber, IsString, IsUUID, Max, Min } from 'class-validator'
import { IsEthAddress } from '../util/IsEthAddress'

export class PaymentCreatedEvent {
  @IsUUID()
  @IsString()
  id: string = v4()

  @IsNotIn([EnumPaymentCreatedEventType.unknown])
  @IsEnum(EnumPaymentCreatedEventType)
  type: EnumPaymentCreatedEventType = EnumPaymentCreatedEventType.unknown

  @IsEthAddress()
  @IsString()
  party1: string = ''

  @IsEthAddress()
  @IsString()
  party2: string = ''

  @IsEthAddress()
  @IsString()
  contract: string = ''

  @IsEthAddress()
  @IsString()
  judgeContract: string = ''

  @IsEthAddress()
  @IsString()
  token: string = ''

  @Min(0)
  @Max(100)
  @IsNumber()
  discount: number = 0

  @Min(0)
  @IsNumber()
  ethPaid: number = 0

  constructor(props: Partial<PaymentCreatedEvent>) {
    Object.assign(this, props)
  }
}
