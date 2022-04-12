import { dbService } from '@solomon/backend/service-db'
import { appService } from './appService'
import { webhookService } from './webhookService'
import { ethService } from './ethService'
import { mailService } from './mailService'
import { deliverService } from './deliverService'

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
