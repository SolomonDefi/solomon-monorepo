import {
  appService,
  dbService,
  deliverService,
  ethService,
  mailService,
  webhookService,
} from '@solomon/blockchain-watcher/feature-app'

let start = async () => {
  await dbService.init()
  await ethService.init()
  await mailService.init()
  await deliverService.init()
  await webhookService.init()
  await appService.init()
  console.log(`Blockchain watcher server start success.`)
}

start()
