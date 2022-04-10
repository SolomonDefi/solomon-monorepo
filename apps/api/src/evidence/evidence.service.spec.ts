import { Test } from '@nestjs/testing'
import { EvidenceService } from './evidence.service'

describe('EvidenceService', () => {
  let service: EvidenceService

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [EvidenceService],
    }).compile()

    service = app.get<EvidenceService>(EvidenceService)
  })

  it('is a placeholder', () => {
    // TODO
  })
})
