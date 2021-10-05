type AnyJson = boolean | number | string | null | IJsonArray | IJsonObject

export interface IJsonObject {
  [key: string]: AnyJson
}

export interface IJsonArray extends Array<AnyJson> {}
