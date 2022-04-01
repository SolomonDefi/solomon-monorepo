import { Injectable } from '@nestjs/common'

@Injectable()
export class HealthService {
  ping(): string {
    return 'pong'
  }
}
