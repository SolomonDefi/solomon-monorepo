import { v4 } from 'uuid'
import { IsEthAddress } from '@solomon/shared/util-validator'
import { IsBoolean, IsDate, IsEmail, IsString } from 'class-validator'
import { IUser } from '@solomon/shared/util-interface'

export class UserResult implements Partial<IUser> {
  @IsString()
  id: string = v4()

  @IsString()
  @IsEmail()
  email: string = ''

  @IsString()
  fullName: string = ''

  @IsString()
  @IsEthAddress()
  ethAddress: string = ''

  @IsBoolean()
  isAdmin: boolean = false

  @IsDate()
  createDate: Date = null

  @IsDate()
  updateDate: Date = null

  constructor(props: Partial<UserResult>) {
    for (let key of Object.keys(props)) {
      if (typeof this[key] !== 'undefined') {
        this[key] = props[key]
      }
    }

    this.createDate = new Date(this.createDate)
    this.updateDate = new Date(this.updateDate)
  }
}
