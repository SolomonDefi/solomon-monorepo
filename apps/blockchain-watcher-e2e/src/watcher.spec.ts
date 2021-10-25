import {
  dbService,
  ethService,
  mailService,
} from '@solomon/blockchain-watcher/feature-app'

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
