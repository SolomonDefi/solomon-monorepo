import { IsDate, IsString, IsUrl, IsUUID, MaxLength } from 'class-validator'
import { v4 } from 'uuid'
import { IEvidence } from '@solomon/shared/util-interface'

export class EvidenceResult implements Partial<IEvidence> {
  @IsString()
  @IsUUID()
  id: string = v4()

  @IsString()
  @MaxLength(40)
  title: string = ''

  @IsString()
  @MaxLength(400)
  description: string = ''

  @IsString()
  @IsUrl()
  fileUrl: string = ''

  @IsDate()
  createDate: Date = null

  @IsDate()
  updateDate: Date = null

  constructor(props: Partial<EvidenceResult>) {
    for (let key of Object.keys(props)) {
      if (typeof this[key] !== 'undefined') {
        this[key] = props[key]
      }
    }
  }
}
