import supertest from 'supertest'
import { envStore } from '@solomon/shared/store-env'

describe('api /health', () => {
  const api = supertest(`http://127.0.0.1:${envStore.apiPort}`)

  test('GET /ping', async () => {
    api.get('/ping').expect(200).expect('pong')
  })
})
