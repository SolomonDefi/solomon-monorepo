import { EnumPaymentCreatedEventType } from '../Enum/EnumPaymentCreatedEventType'
import { v4 } from 'uuid'
import {
  IsEnum,
  IsNotIn,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  Min,
  validateSync,
} from 'class-validator'
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

  isValid() {
    let errArr = validateSync(this)

    if (errArr.length > 0) {
      for (let err of errArr) {
        console.error(err)
      }
      return false
    }

    return true
  }

  constructor(props: Partial<PaymentCreatedEvent>) {
    Object.assign(this, props)
  }
}
