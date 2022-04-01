import { Module } from '@nestjs/common'
import { EvidenceModule } from './evidence/evidence.module'
import { HealthModule } from './health/health.module'
import { UserModule } from './user/user.module'
import { EventModule } from './event/event.module'

@Module({
  imports: [HealthModule, EvidenceModule, UserModule, EventModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
