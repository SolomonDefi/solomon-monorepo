import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";

@Entity({
  tableName: 'scan_log',
})
export class ScanLogEntity {
  @PrimaryKey()
  id: string = v4()

  @Property()
  blockHash!: string

  @Property()
  lastScanned!: number
}
