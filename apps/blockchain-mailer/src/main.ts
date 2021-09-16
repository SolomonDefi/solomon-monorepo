import 'reflect-metadata'
import mailService from './service/mailService'
import ethService from './service/ethService'
import dbService from './service/dbService'

let start = async () => {
  await dbService.init()
  await mailService.init()
  await ethService.init()
}

start()
