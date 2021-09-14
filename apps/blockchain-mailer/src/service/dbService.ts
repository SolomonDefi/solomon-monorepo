import {MikroORM} from "@mikro-orm/core";
import path from "path";
import envStore from "../store/envStore";
import {ScanLogEntity} from "../Entity/ScanLogEntity";
import {QueryOrderNumeric} from "@mikro-orm/core/enums";
import {pathExists, remove} from "fs-extra";

export class DbService {

  orm: MikroORM = null as any

  get sqlitePath(): string {
    return path.resolve(__dirname, '..', '..', `blockchain-mailer-storage.${envStore.envName}.db`)
  }

  get scanLogRepository() {
    return this.orm.em.getRepository(ScanLogEntity)
  }

  async setLastScanned(blockHash: string) {
    let newLog = this.scanLogRepository.create({
      blockHash: blockHash,
      lastScanned: Date.now(),
    })

    await this.scanLogRepository.persistAndFlush(newLog)
  }

  async getLastScanned() {
    let lastLog = await this.scanLogRepository.find({}, {
      orderBy: {
        lastScanned: QueryOrderNumeric.DESC,
      },
      limit: 1,
    })

    return lastLog[0]
  }

  async resetForTest() {
    await remove(this.sqlitePath)
    await this.init()
  }

  async init() {
    let isDbExist = await pathExists(this.sqlitePath)
    let orm = await MikroORM.init({
      entities: [
        ScanLogEntity,
      ],
      dbName: this.sqlitePath,
      type: 'sqlite',
    })

    this.orm = orm

    if(!isDbExist) {
      let generator = await this.orm.getSchemaGenerator()

      await generator.dropSchema()
      await generator.createSchema()
      await generator.updateSchema()
    }
  }
}

export default new DbService()
