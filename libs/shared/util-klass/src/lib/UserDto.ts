import { v4 } from 'uuid'
import { IsEthAddress } from '@solomon/shared/util-validator'
import { IsBoolean, IsDate, IsEmail, IsString } from 'class-validator'
import { IUser } from '@solomon/shared/util-interface'

export class UserDto implements Partial<IUser> {
  @IsString()
  id: string = v4()

  @IsString()
  @IsEmail()
  email: string = ''

  @IsString()
  password: string = ''

  @IsString()
  fullName: string = ''

  @IsString()
  @IsEthAddress()
  ethAddress: string = ''

  constructor(props: Partial<UserDto>) {
    for (let key of Object.keys(props)) {
      if (typeof this[key] !== 'undefined') {
        this[key] = props[key]
      }
    }
  }
}
