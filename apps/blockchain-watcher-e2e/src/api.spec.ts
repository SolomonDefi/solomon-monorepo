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
    let getRes = await fetch(`http://localhost:3001/health-check`, { method: 'get' })
    let postRes = await fetch(`http://localhost:3001/health-check`, { method: 'post' })
    let putRes = await fetch(`http://localhost:3001/health-check`, { method: 'put' })
    let deleteRes = await fetch(`http://localhost:3001/health-check`, {
      method: 'delete',
    })

    expect(getRes.ok).toEqual(true)
    expect(getRes.status).toEqual(204)
    expect(await getRes.text()).toEqual('')
    expect(postRes.ok).toEqual(true)
    expect(postRes.status).toEqual(204)
    expect(await postRes.text()).toEqual('')
    expect(putRes.ok).toEqual(true)
    expect(putRes.status).toEqual(204)
    expect(await putRes.text()).toEqual('')
    expect(deleteRes.ok).toEqual(true)
    expect(deleteRes.status).toEqual(204)
    expect(await deleteRes.text()).toEqual('')
  })
})
