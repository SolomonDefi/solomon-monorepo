export type I18nValue = string | I18nArray | I18nObject
export type I18nArray = Array<string | I18nObject>
export type I18nObject = { [member: string]: I18nValue }

export const getDeep = (key: string, copy: I18nObject): I18nValue => {
  const path = key.split('.')
  let copyValue: I18nValue = copy
  for (const subkey of path) {
    copyValue = copyValue[subkey]
    if (!copyValue) {
      console.warn(`Copy key not found: ${key}`)
      return key
    }
  }
  return copyValue
}

export class SimpleI18n {
  fallback: I18nObject

  constructor(fallback: I18nObject) {
    this.fallback = fallback
  }

  s(key: string, copy?: I18nObject): string {
    const val = getDeep(key, copy ?? this.fallback)
    if (Array.isArray(val)) {
      throw new Error('Copy: expected string, found array')
    } else if (typeof val !== 'string') {
      throw new Error(`Copy: expected string, found ${typeof val}`)
    }
    return val
  }

  r(key: string, copy?: I18nObject): I18nObject {
    const val = getDeep(key, copy ?? this.fallback)
    if (typeof val !== 'object') {
      throw new Error(`Copy: expected record, found ${typeof val}`)
    } else if (Array.isArray(val)) {
      throw new Error('Copy: expected record, found array')
    }
    return val as I18nObject
  }

  a(key: string, copy?: I18nObject): I18nArray {
    const val = getDeep(key, copy ?? this.fallback)
    if (!Array.isArray(val)) {
      throw new Error(`Copy: expected array, found ${typeof val}`)
    }
    return val
  }
}

export const getString =
  (i18n: SimpleI18n) =>
  (key: string, copy?: I18nObject): string =>
    i18n.s(key, copy)

export const getArray =
  (i18n: SimpleI18n) =>
  (key: string, copy?: I18nObject): I18nArray =>
    i18n.a(key, copy)

export const getRecord =
  (i18n: SimpleI18n) =>
  (key: string, copy?: I18nObject): I18nObject =>
    i18n.r(key, copy)
