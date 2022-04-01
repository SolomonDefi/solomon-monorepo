import { Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { EventService } from './event.service'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { EnumEventType } from './EnumEventType'

@Controller({
  path: '/event',
})
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // TODO: I'm not sure something like "dispute.preorder.created" is the best idea. Should have more think here.

  @ApiOperation({
    summary: '',
    description: '',
  })
  @ApiResponse({
    status: 200,
    description: '',
  })
  @Post('/:type')
  emitEvent(@Param() eventType: EnumEventType) {}
}
