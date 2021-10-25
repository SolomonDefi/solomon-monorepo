import { dbService, mailService } from '@solomon/blockchain-watcher/feature-app'

let start = async () => {
  await dbService.init()
  await mailService.init()
  // await ethService.init()
  console.log(`Blockchain watcher server start success.`)
}

start()
