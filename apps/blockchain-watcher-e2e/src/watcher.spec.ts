import { dbService, ethService, mailService } from '@solomon/lib-blockchain-watcher'

describe('mailService', () => {
  it('can start', async () => {
    const start = async () => {
      await dbService.init()
      await mailService.init()
      await ethService.init()
    }

    expect(() => {
      start()
    }).not.toThrow()
  })
})
