import 'jest-fetch-mock'
import { WebApi } from './api'

describe('webDataAccessApi', () => {
  it('should work', () => {
    const baseUrl = '/test/'
    const api = new WebApi({
      baseUrl,
    })
    expect(api.baseUrl).toEqual(baseUrl)
  })
})
