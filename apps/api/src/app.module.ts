import { Module } from '@nestjs/common'
import { EvidenceModule } from './evidence/evidence.module'
import { HealthModule } from './health/health.module'
import { UserModule } from './user/user.module'
import { EventModule } from './event/event.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [HealthModule, EvidenceModule, UserModule, EventModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
