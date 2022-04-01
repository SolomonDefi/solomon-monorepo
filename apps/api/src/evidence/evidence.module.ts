import { Module } from '@nestjs/common'
import { EvidenceController } from './evidence.controller'
import { EvidenceService } from './evidence.service'

@Module({
  imports: [],
  controllers: [EvidenceController],
  providers: [EvidenceService],
})
export class EvidenceModule {}
