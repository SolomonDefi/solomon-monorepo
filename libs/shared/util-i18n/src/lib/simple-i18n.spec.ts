import { getArray, getRecord, getString, SimpleI18n } from './simple-i18n'

describe('simple i18n', () => {
  const fallback = { test: { arr: ['1', '2', '3'], str: 'thing' } }
  it('should get different types correctly', () => {
    const i18n = new SimpleI18n(fallback)
    expect(i18n.s('test.str')).toEqual('thing')

    expect(i18n.r('test')).toEqual({ arr: ['1', '2', '3'], str: 'thing' })

    expect(i18n.a('test.arr')).toEqual(['1', '2', '3'])
    expect(i18n.s('test.arr.1')).toEqual('2')
  })

  it('helpers should get different types correctly', () => {
    const i18n = new SimpleI18n(fallback)
    const ts = getString(i18n)
    const ta = getArray(i18n)
    const tr = getRecord(i18n)

    expect(ts('test.str')).toEqual('thing')

    expect(tr('test')).toEqual({ arr: ['1', '2', '3'], str: 'thing' })

    expect(ta('test.arr')).toEqual(['1', '2', '3'])
    expect(ts('test.arr.1')).toEqual('2')
  })

  it('should fail to get the wrong types', () => {
    const i18n = new SimpleI18n(fallback)

    expect(() => i18n.a('test.str')).toThrow('Copy: expected array, found string')

    expect(() => i18n.r('test.str')).toThrow('Copy: expected record, found string')
    expect(() => i18n.r('test.arr')).toThrow('Copy: expected record, found array')

    expect(() => i18n.s('test.arr')).toThrow('Copy: expected string, found array')
    expect(() => i18n.s('test')).toThrow('Copy: expected string, found object')
  })
})
