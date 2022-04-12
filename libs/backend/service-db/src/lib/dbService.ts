import 'reflect-metadata'
import { MikroORM } from '@mikro-orm/core'
import { QueryOrderNumeric } from '@mikro-orm/core'
import { ScanLogEntity } from './ScanLogEntity'

export class DbService {
  orm: MikroORM = null as any

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
    let lastLog = await this.scanLogRepository.find(
      {},
      {
        orderBy: {
          lastScanned: QueryOrderNumeric.DESC,
        },
        limit: 1,
      },
    )

    return lastLog[0]
  }

  async init() {
    const orm = await MikroORM.init({
      entities: [ScanLogEntity],
      type: 'postgresql',
      // todo: get from env
      dbName: 'solomon_db',
      user: 'postgres',
      password: 'postgres',
    })

    this.orm = orm
  }

  async close(force = true) {
    if (!this.orm) {
      return
    }

    await this.orm.close(force)
  }

  async reset() {
    const generator = await this.orm.getSchemaGenerator()

    await generator.dropSchema()
    await generator.createSchema()
    await generator.updateSchema()
  }

  async resetForTest() {
    await this.close()
    await this.init()
    await this.reset()
  }
}

export const dbService = new DbService()
