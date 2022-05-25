import { EnumEventType } from '@solomon/shared/util-enum'

export interface IBaseEvent {
  id: string
  type: EnumEventType
  party1: string
  party2: string
  contract: string
}
