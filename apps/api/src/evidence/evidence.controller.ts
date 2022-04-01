import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
} from '@nestjs/common'
import { EvidenceService } from './evidence.service'
import 'multer'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

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
  getEvidence() {
    // TODO: Get all evidences, with paging and sorting. Only for admin.
  }

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
  @ApiResponse({
    status: 404,
    description: '',
  })
  @Get('/:id')
  getEvidenceById(@Param('id') id: string) {
    // TODO: Get evidence by id. only for admin.
  }

  @ApiOperation({
    summary: '',
    description: '',
  })
  @ApiResponse({
    status: 201,
    description: '',
  })
  @ApiResponse({
    status: 400,
    description: '',
  })
  @Post('/')
  uploadEvidence(@UploadedFile() file: Express.Multer.File, @Body() body) {
    const title = body['title']
    const description = body['description']
    // TODO: Upload evidence to S3 & insert into db
  }

  @ApiOperation({
    summary: '',
    description: '',
  })
  @ApiResponse({
    status: 201,
    description: '',
  })
  @ApiResponse({
    status: 400,
    description: '',
  })
  @ApiResponse({
    status: 404,
    description: '',
  })
  @Put('/:id')
  upsertEvidence(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body,
  ) {
    const title = body['title']
    const description = body['description']
    // TODO: Upsert evidence to S3 & upsert to db
  }

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
  @ApiResponse({
    status: 404,
    description: '',
  })
  @Delete('/:id')
  deleteEvidence(@Param('id') id: string) {
    // TODO: Delete evidence
  }
}
