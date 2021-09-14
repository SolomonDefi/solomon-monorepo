import dbService, {DbService} from "./dbService";
import * as fse from "fs-extra";

describe("dbService", ()=> {

  beforeEach(async ()=> {
    await dbService.resetForTest()
  })

  test("constructor()", async ()=> {
    expect(dbService).toBeInstanceOf(DbService)
  })

  test("init()", async ()=> {
    expect(fse.existsSync(dbService.sqlitePath)).toBe(true)
  })

  test("setLastScanned()", async ()=> {
    await dbService.setLastScanned("block1")

    let r1 = await dbService.scanLogRepository.findAll()

    expect(r1.length).toEqual(1)
    expect(r1[0].blockHash).toEqual("block1")
    expect(r1[0].lastScanned).toBeGreaterThan(0)

    await dbService.setLastScanned("block2")
    await dbService.setLastScanned("block3")

    let r2 = await dbService.scanLogRepository.findAll()
    let hashArr = r2.map((entity)=> (entity.blockHash)).sort()

    expect(r2.length).toEqual(3)
    expect(hashArr).toEqual(['block1', 'block2', 'block3'])
  })
})
