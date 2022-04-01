import { Test, TestingModule } from '@nestjs/testing'
import { EvidenceController } from './evidence.controller'
import { EvidenceService } from './evidence.service'

describe('EvidenceController', () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [EvidenceController],
      providers: [EvidenceService],
    }).compile()
  })
})
