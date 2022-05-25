import 'reflect-metadata'
import { MikroORM } from '@mikro-orm/core'
import { ScanLogEntity } from '../entity/ScanLogEntity'
import { EvidenceEntity } from '../entity/EvidenceEntity'
import { envStore } from '@solomon/shared/store-env'
import { UserEntity } from '../entity/UserEntity'
import { EventEntity } from '../entity/EventEntity'

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

  get eventRepository() {
    return this.orm.em.getRepository(EventEntity)
  }

  async init() {
    const orm = await MikroORM.init({
      entities: [ScanLogEntity, EvidenceEntity, UserEntity, EventEntity],
      type: 'postgresql',
      dbName: envStore.dbName,
      user: envStore.dbUser,
      password: envStore.dbPassword,
      // fixme: I think it's an issue about how we use MikroORM with NestJS
      allowGlobalContext: true,
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
