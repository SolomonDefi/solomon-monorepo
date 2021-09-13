import dbService, {DbService} from "./dbService";
import * as fse from "fs-extra";

describe("dbService", ()=> {

  beforeAll(async ()=> {
    await fse.remove(dbService.sqlitePath)
  })

  test("constructor()", async ()=> {
    expect(dbService).toBeInstanceOf(DbService)
  })

  test("init()", async ()=> {
    await dbService.init()

    expect(fse.existsSync(dbService.sqlitePath)).toBe(true)
  })
})
