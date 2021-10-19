import { dbService, mailService } from '@solomon/lib-blockchain-watcher'

let start = async () => {
  await dbService.init()
  await mailService.init()
  // await ethService.init()
  console.log(`Blockchain watcher server start success.`)
}

start()
