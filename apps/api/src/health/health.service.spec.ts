import { Test } from '@nestjs/testing'
import { HealthService } from './health.service'

describe('HealthService', () => {
  let service: HealthService

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [HealthService],
    }).compile()

    service = app.get<HealthService>(HealthService)
  })

  it('ping()', () => {
    expect(service.ping()).toEqual('pong')
  })
})
