import { Test, TestingModule } from '@nestjs/testing'
import { HealthController } from './health.controller'
import { HealthService } from './health.service'

describe('HealthController', () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile()
  })

  it('ping()', () => {
    const appController = app.get<HealthController>(HealthController)
    expect(appController.ping()).toEqual('pong')
  })
})
