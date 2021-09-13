import {MikroORM} from "@mikro-orm/core";
import path from "path";
import {FooEntity} from "../Entity/FooEntity";
import envStore from "../store/envStore";

export class DbService {

  orm: MikroORM = null as any

  get sqlitePath(): string {
    return path.resolve(__dirname, '..', '..', `blockchain-mailer-storage.${envStore.envName}.db`)
  }

  async setLastScannedBlockAddress() {

  }

  async getLastScannedBlockAddress() {

  }

  async init() {
    let orm = await MikroORM.init({
      entities: [
        FooEntity,
      ],
      dbName: this.sqlitePath,
      type: 'sqlite',
    })

    this.orm = orm
  }
}

export default new DbService()
