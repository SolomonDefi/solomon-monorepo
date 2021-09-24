import 'reflect-metadata'
import dbService from './service/dbService'
import mailService from './service/mailService'

let start = async () => {
  await dbService.init()
  await mailService.init()
  // await ethService.init()
  console.log(`Blockchain watcher server start success.`)
}

start()
