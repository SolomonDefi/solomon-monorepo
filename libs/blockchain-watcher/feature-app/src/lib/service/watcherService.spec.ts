import { WatcherService, watcherService } from "@solomon/blockchain-watcher/feature-app";

describe('watcherService basic', ()=> {
  test('constructor()', async ()=> {
    expect(watcherService).toBeInstanceOf(WatcherService)
  })

  test('init()', async ()=> {
    await expect(watcherService.init()).resolves.not.toThrow()
  })

  test('start()', async ()=> {
    await expect(watcherService.start()).resolves.not.toThrow()
    expect(watcherService.isWatching).toEqual(true)
  })

  test('stop()', async ()=> {
    await expect(watcherService.stop()).resolves.not.toThrow()
    expect(watcherService.isWatching).toEqual(false)
  })
})

describe('watcherService', ()=> {
  beforeAll(async ()=> {
    await watcherService.init()
    await watcherService.start()
  })

  afterAll(async ()=> {
    await watcherService.stop()
  })
})
