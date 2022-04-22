import { dbService, DbService } from './dbService'

describe('dbService', () => {
  beforeEach(async () => {
    await dbService.resetForTest()
  })

  afterAll(async () => {
    await dbService.close(true)
  })

  afterAll(async () => {
    await dbService.close(true)
  })

  test('constructor()', async () => {
    expect(dbService).toBeInstanceOf(DbService)
  })

  test('init()', async () => {
    expect(dbService.orm).not.toEqual(null)
  })
})
