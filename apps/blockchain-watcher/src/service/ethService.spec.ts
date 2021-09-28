import ethService, { EthService } from './ethService'

describe('ethService', () => {
  beforeAll(async () => {
    await expect(ethService.init()).resolves.not.toThrow()
  })

  test('constructor()', async () => {
    expect(ethService).toBeInstanceOf(EthService)
  })

  test('init()', async () => {
    expect(ethService.provider).not.toBeNull()
    expect(ethService.contract).not.toBeNull()
  })
})
