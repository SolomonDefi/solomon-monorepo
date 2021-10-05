import { IJsonObject } from '@solomon/shared/util-core'

export class ApiResponse extends Response {
  data!: IJsonObject
}

export interface IEvidence {
  id: string
}
export interface EvidenceApiResponse extends IEvidence {}
export class EvidenceApiResponse implements IEvidence {}

interface IPrivateProfile {
  email: string | null
  avatar: string | null
  bio: string | null
  name: string | null
  joined: number | null
}
export interface PrivateProfileApiResponse extends IPrivateProfile {}
export class PrivateProfileApiResponse implements IPrivateProfile {}
