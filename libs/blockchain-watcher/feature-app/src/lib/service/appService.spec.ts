import { AppService, appService } from './appService'

describe('appService', () => {
  afterEach(async () => {
    await appService.destroy()
  })

  it('constructor()', async () => {
    expect(appService).toBeInstanceOf(AppService)
  })

  it('init() and destroy()', async () => {
    await appService.init()

    expect(appService.app).toBeDefined()

    await appService.destroy()

    expect(appService.app).toBe(null)
  })

  it('start() and stop()', async () => {
    await appService.init()
    await appService.start()

    expect(appService.server.listening).toBe(true)

    await appService.stop()

    expect(appService.server.listening).toBe(false)
  })
})
