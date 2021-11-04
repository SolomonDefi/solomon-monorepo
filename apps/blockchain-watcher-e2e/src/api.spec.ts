import { appService } from '@solomon/blockchain-watcher/feature-app'
import fetch from 'node-fetch'

describe('Watcher api services', () => {
  beforeEach(async () => {
    await appService.init()
    await appService.start()
  })

  afterEach(async () => {
    await appService.stop()
    await appService.destroy()
  })

  it('/health-check', async () => {
    let res = await fetch(`http://localhost:3001/health-check`, { method: 'get' })

    expect(res.ok).toEqual(true)
    expect(res.status).toEqual(204)
    expect(await res.text()).toEqual('')
  })
})
