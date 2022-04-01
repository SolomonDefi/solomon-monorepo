import { Controller, Get } from '@nestjs/common'
import { HealthService } from './health.service'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

@Controller({
  path: '/health',
})
export class HealthController {
  constructor(private readonly appService: HealthService) {}

  @ApiOperation({
    summary: '',
    description: '',
  })
  @ApiResponse({
    status: 200,
    description: '',
  })
  @Get('/ping')
  ping(): string {
    return this.appService.ping()
  }
}
