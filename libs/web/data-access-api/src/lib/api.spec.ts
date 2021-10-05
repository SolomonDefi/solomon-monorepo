import 'jest-fetch-mock'
import { NftApi } from './api'

describe('webDataAccessApi', () => {
  it('should work', () => {
    const baseUrl = '/test/'
    const api = new NftApi({
      baseUrl,
    })
    expect(api.baseUrl).toEqual(baseUrl)
  })
})
