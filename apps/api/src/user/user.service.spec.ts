import { Test } from '@nestjs/testing'
import { UserService } from './user.service'

describe('UserService', () => {
  let service: UserService

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [UserService],
    }).compile()

    service = app.get<UserService>(UserService)
  })
})
