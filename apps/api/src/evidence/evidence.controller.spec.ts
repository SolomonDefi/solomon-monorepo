import { Test } from '@nestjs/testing'
import { EvidenceController } from './evidence.controller'
import { EvidenceService } from './evidence.service'

describe('EvidenceController', () => {
  let evidenceController: EvidenceController

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [EvidenceController],
      providers: [EvidenceService],
    }).compile()

    evidenceController = testingModule.get<EvidenceController>(EvidenceController)
  })

  it('', () => {})
})
