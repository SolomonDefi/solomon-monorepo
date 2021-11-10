import {
  appService,
  dbService, deliverService,
  ethService,
  mailService, webhookService
} from "@solomon/blockchain-watcher/feature-app";

describe('watcher', () => {
  const start = async () => {
    await dbService.init()
    await ethService.init()
    await mailService.init()
    await deliverService.init()
    await webhookService.init()
    await appService.init()
  }

  it('start without eth environment', async () => {
    await expect(start()).resolves.not.toThrow()
  })
})
