import {
  appService,
  dbService,
  deliverService,
  ethService,
  mailService,
  webhookService,
} from '@solomon/blockchain-watcher/feature-app'

export class WatcherService {
  isWatching: boolean = false

  async start() {
    await ethService.start()
    this.isWatching = true
    console.log(`Blockchain watcher start.`)
  }

  async stop() {
    await ethService.stop()
    this.isWatching = false
    console.log(`Blockchain watcher stop.`)
  }

  async init() {
    await dbService.init()
    await ethService.init()
    await mailService.init()
    await deliverService.init()
    await webhookService.init()
    await appService.init()
    console.log(`Blockchain watcher init success.`)
  }
}

export const watcherService = new WatcherService()
