import 'reflect-metadata'
import { MikroORM } from '@mikro-orm/core'
import { ScanLogEntity } from '../entity/ScanLogEntity'
import { EvidenceEntity } from '../entity/EvidenceEntity'
import { envStore } from '@solomon/shared/store-env'
import { UserEntity } from '../entity/UserEntity'

export class DbService {
  orm: MikroORM = null as any

  get scanLogRepository() {
    return this.orm.em.getRepository(ScanLogEntity)
  }

  get evidenceRepository() {
    return this.orm.em.getRepository(EvidenceEntity)
  }

  get userRepository() {
    return this.orm.em.getRepository(UserEntity)
  }

  async init() {
    const orm = await MikroORM.init({
      entities: [ScanLogEntity, EvidenceEntity, UserEntity],
      type: 'postgresql',
      dbName: envStore.dbName,
      user: envStore.dbUser,
      password: envStore.dbPassword,
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

    await generator.ensureDatabase()
    await generator.dropSchema()
    await generator.createSchema()
  }

  async resetForTest() {
    await this.close()
    await this.init()
    await this.reset()
  }
}

export const dbService = new DbService()
