import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
import { v4 } from 'uuid'
import { IEvidence } from '@solomon/shared/util-interface'

@Entity({
  tableName: 'evidence',
})
export class EvidenceEntity implements IEvidence {
  @PrimaryKey()
  id: string = v4()

  @Property()
  title: string = ''

  @Property()
  description: string = ''

  @Property()
  fileUrl: string = ''

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
