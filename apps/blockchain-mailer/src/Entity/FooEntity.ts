import {Entity, PrimaryKey, Property} from "@mikro-orm/core";

@Entity({
  tableName: 'foo',
})
export class FooEntity {

  @PrimaryKey()
  id!: string

  @Property()
  bar!: string
}
