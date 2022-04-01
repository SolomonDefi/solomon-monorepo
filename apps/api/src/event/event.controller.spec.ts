import { Test, TestingModule } from '@nestjs/testing'
import { EventController } from './event.controller'
import { EventService } from './event.service'

describe('EventController', () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [EventController],
      providers: [EventService],
    }).compile()
  })
})
