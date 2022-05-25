import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common'
import { EventService } from './event.service'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { SignatureGuard } from '../auth/signature.guard'
import { validate } from 'class-validator'
import { loggerService } from '@solomon/shared/service-logger'
import { Response } from 'express'
import { TEventDto } from '@solomon/shared/util-klass'
import { klassHelper } from '@solomon/shared/util-klass'

@Controller({
  path: '/event',
})
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @ApiOperation({
    summary: '',
    description: '',
  })
  @ApiResponse({
    status: 200,
    description: '',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request.',
  })
  @ApiResponse({
    status: 403,
    description: 'Invalid signature.',
  })
  @Post('/')
  @UseGuards(SignatureGuard)
  async emitEvent(@Body() body: TEventDto, @Res() res: Response) {
    let eventDto: TEventDto = null

    try {
      eventDto = klassHelper.generateEventDto(body)
    } catch (err) {
      loggerService.error(err)
      return res.status(400).json({
        message: 'Invalid request',
        error: err,
      })
    }

    const validateErr = await validate(eventDto)

    if (validateErr.length > 0) {
      loggerService.error(validateErr)
      return res.status(400).json({
        message: 'Invalid request',
        error: validateErr,
      })
    }

    await this.eventService.saveEvent(eventDto)

    res.status(200).send()
  }
}
