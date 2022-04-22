import { v4 } from 'uuid'
import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { IUser } from '@solomon/shared/util-interface'

@Entity({
  tableName: 'user',
})
export class UserEntity implements IUser {
  @PrimaryKey()
  id: string = v4()

  @Property()
  email: string = ''

  @Property()
  password: string = ''

  @Property()
  fullName: string = ''

  @Property()
  ethAddress: string = ''

  @Property()
  isAdmin: boolean = false

  @Property()
  isDeleted: boolean = false

  @Property({
    nullable: true,
  })
  createDate: Date = null

  @Property({
    nullable: true,
  })
  updateDate: Date = null

  @Property({
    nullable: true,
  })
  deleteDate: Date = null
}
