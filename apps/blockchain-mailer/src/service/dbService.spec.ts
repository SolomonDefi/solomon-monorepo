import dbService, { DbService } from './dbService'
import * as fse from 'fs-extra'

describe('dbService', () => {
  beforeEach(async () => {
    await dbService.resetForTest()
  })

  test('constructor()', async () => {
    expect(dbService).toBeInstanceOf(DbService)
  })

  test('init()', async () => {
    expect(fse.existsSync(dbService.sqlitePath)).toBe(true)
  })

  test('setLastScanned()', async () => {
    await dbService.setLastScanned('block1')

    let r1 = await dbService.scanLogRepository.findAll()

    expect(r1.length).toEqual(1)
    expect(r1[0].blockHash).toEqual('block1')
    expect(r1[0].lastScanned).toBeGreaterThan(0)

    await dbService.setLastScanned('block2')
    await dbService.setLastScanned('block3')

    let r2 = await dbService.scanLogRepository.findAll()
    let hashArr = r2.map((entity) => entity.blockHash).sort()

    expect(r2.length).toEqual(3)
    expect(hashArr).toEqual(['block1', 'block2', 'block3'])
  })

  test('getLastScanned()', async () => {
    let log1 = dbService.scanLogRepository.create({
      blockHash: 'block1',
      lastScanned: 1,
    })
    let log2 = dbService.scanLogRepository.create({
      blockHash: 'block2',
      lastScanned: 2,
    })
    let log3 = dbService.scanLogRepository.create({
      blockHash: 'block3',
      lastScanned: 3,
    })

    await dbService.scanLogRepository.persistAndFlush([log1, log2, log3])

    let r1 = await dbService.getLastScanned()

    expect(r1?.id).toEqual(log3.id)
  })
})
