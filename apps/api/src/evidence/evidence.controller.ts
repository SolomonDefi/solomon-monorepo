import { Express, Response } from 'express'
import 'multer'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { EvidenceService } from './evidence.service'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { validate } from 'class-validator'
import { EvidenceDto } from '@solomon/shared/util-klass'
import { loggerService } from '@solomon/shared/service-logger'
import { AdminGuard } from '../auth/admin.guard'

@Controller({
  path: '/evidence',
})
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @ApiOperation({
    summary: '',
    description: '',
  })
  @ApiResponse({
    status: 200,
    description: '',
  })
  @ApiResponse({
    status: 403,
    description: '',
  })
  @Get('/')
  @UseGuards(AdminGuard)
  getEvidence() {
    // TODO: Get all evidences, with paging and sorting. Only for admin.
  }

  @ApiOperation({
    summary: 'Get evidence',
    description: 'Get evidence',
  })
  @ApiResponse({
    status: 200,
    description: 'Get success.',
  })
  @ApiResponse({
    status: 403,
    description: 'Permission denied.',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found',
  })
  @Get('/:id')
  @UseGuards(AdminGuard)
  async getEvidenceById(@Param('id') id: string, @Res() res: Response) {
    let evidences = await this.evidenceService.getEvidenceById(id)

    if (!evidences) {
      return res.status(404).json({
        message: 'Not found',
        error: `Evidence with id ${id} not exist.`,
      })
    }

    return res.status(200).json(evidences[0])
  }

  @ApiOperation({
    summary: 'Upload evidence',
    description: 'Upload evidence file and save data to db.',
  })
  @ApiResponse({
    status: 201,
    description: 'Evidence created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request.',
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post('/')
  async createEvidence(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: EvidenceDto,
    @Res() res: Response,
  ) {
    const evidence = new EvidenceDto(body)
    const validateErr = await validate(evidence)

    if (validateErr.length > 0) {
      loggerService.error(validateErr)
      return res.status(400).json({
        message: 'Invalid request',
        error: validateErr,
      })
    }

    try {
      await this.evidenceService.addEvidence(evidence, file.buffer)
    } catch (err) {
      loggerService.error(err)
      return res.status(500).json({
        message: 'Add evidence error',
        error: err,
      })
    }

    return res.status(201).send()
  }

  @ApiOperation({
    summary: 'Update evidence',
    description: 'Update exist evidence.',
  })
  @ApiResponse({
    status: 201,
    description: 'Evidence updated.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request.',
  })
  @ApiResponse({
    status: 404,
    description: 'Evidence not exist.',
  })
  @Put('/')
  async updateEvidence(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: EvidenceDto,
    @Res() res: Response,
  ) {
    const evidence = new EvidenceDto(body)
    const validateErr = await validate(evidence)

    if (validateErr.length > 0) {
      loggerService.error(validateErr)
      return res.status(400).json({
        message: 'Invalid request',
        error: validateErr,
      })
    }

    try {
      await this.evidenceService.updateEvidence(evidence, file.buffer)
    } catch (err) {
      return res.status(500).json({
        message: 'Update evidence error',
        error: err,
      })
    }

    return res.status(200).send()
  }

  @ApiOperation({
    summary: 'Delete evidence',
    description: 'Delete evidence.',
  })
  @ApiResponse({
    status: 200,
    description: 'Evidence deleted.',
  })
  @ApiResponse({
    status: 403,
    description: 'Permission denied.',
  })
  @ApiResponse({
    status: 404,
    description: 'Evidence not exist.',
  })
  @Delete('/:id')
  @UseGuards(AdminGuard)
  async deleteEvidence(@Param('id') id: string, @Res() res: Response) {
    const entity = await this.evidenceService.getEvidenceById(id)

    if (!entity) {
      return res.status(400).json({
        message: 'Invalid request',
        error: `Evidence with id ${id} not found.`,
      })
    }

    try {
      await this.evidenceService.deleteEvidenceById(id)
    } catch (err) {
      return res.status(400).json({
        message: 'Delete evidence error',
        error: err,
      })
    }

    return res.status(200).send()
  }
}
