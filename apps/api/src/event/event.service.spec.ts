import { Test } from '@nestjs/testing'
import { EventService } from './event.service'

describe('EventService', () => {
  let service: EventService

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [EventService],
    }).compile()

    service = app.get<EventService>(EventService)
  })
})
