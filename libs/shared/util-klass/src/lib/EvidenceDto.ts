import { IsDate, IsString, IsUrl, IsUUID, MaxLength } from 'class-validator'
import { v4 } from 'uuid'
import { IEvidence } from '@solomon/shared/util-interface'

export class EvidenceDto implements Partial<IEvidence> {
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

  constructor(props: Partial<EvidenceDto>) {
    for (let key of Object.keys(props)) {
      if (typeof this[key] !== 'undefined') {
        this[key] = props[key]
      }
    }
  }
}
