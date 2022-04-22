import { Test } from '@nestjs/testing'
import { EvidenceService } from './evidence.service'
import { readFile } from 'fs-extra'
import * as path from 'path'
import { pathStore } from '@solomon/shared/store-path'
import { dbService } from '@solomon/backend/service-db'
import { mockClient, mockLibStorageUpload } from 'aws-sdk-client-mock'
import { S3Client } from '@aws-sdk/client-s3'
import { EvidenceDto } from '@solomon/shared/util-klass'

describe('EvidenceService', () => {
  let service: EvidenceService

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [EvidenceService],
    }).compile()

    service = app.get<EvidenceService>(EvidenceService)

    await dbService.init()

    const s3ClientMock = mockClient(S3Client)
    mockLibStorageUpload(s3ClientMock)
  })

  afterAll(async () => {
    await dbService.close(true)
  })

  beforeEach(async () => {
    await dbService.resetForTest()
  })

  it('addEvidence()', async () => {
    const fileBuffer = await readFile(
      path.resolve(pathStore.testAssets, 'wtm_256x256.jpeg'),
    )
    const evidence = new EvidenceDto({
      title: 'Title',
      description: 'Description',
      fileUrl: '',
    })

    await service.addEvidence(evidence, fileBuffer)
    const res = await dbService.evidenceRepository.findAll()

    // TODO: expect file uploaded to S3
    expect(res[0].title).toEqual(evidence.title)
    expect(res[0].description).toEqual(evidence.description)
    expect(res[0].fileUrl.length).toBeGreaterThan(0)
  })

  it('getEvidenceById()', async () => {
    const evidence1 = new EvidenceDto({
      title: 'Title1',
      description: 'Description1',
      fileUrl: 'https://example.com/file1',
    })
    const evidence2 = new EvidenceDto({
      title: 'Title2',
      description: 'Description2',
      fileUrl: 'https://example.com/file2',
    })
    const evidenceEntity1 = dbService.evidenceRepository.create(evidence1)
    const evidenceEntity2 = dbService.evidenceRepository.create(evidence2)

    await dbService.evidenceRepository.persistAndFlush([evidenceEntity1, evidenceEntity2])

    const res = await service.getEvidenceById(evidence1.id)

    expect(res).toMatchObject(evidence1)
  })

  it('updateEvidence()', async () => {
    const evidence1 = new EvidenceDto({
      title: 'Title1',
      description: 'Description1',
      fileUrl: 'https://example.com/file1',
    })
    const evidence2 = new EvidenceDto({
      title: 'Title2',
      description: 'Description2',
      fileUrl: 'https://example.com/file2',
    })
    const evidenceEntity1 = dbService.evidenceRepository.create(evidence1)
    const evidenceEntity2 = dbService.evidenceRepository.create(evidence2)

    await dbService.evidenceRepository.persistAndFlush([evidenceEntity1, evidenceEntity2])

    evidence1.title = 'Changed'

    await service.updateEvidence(evidence1)
    const res = await dbService.evidenceRepository.findAll()

    expect(res.find((r) => r.id === evidence1.id)).toMatchObject(evidence1)
    expect(res.find((r) => r.id === evidence2.id)).toMatchObject(evidence2)
  })

  it('deleteEvidenceById()', async () => {
    const evidence1 = new EvidenceDto({
      title: 'Title1',
      description: 'Description1',
      fileUrl: 'https://example.com/file1',
    })
    const evidence2 = new EvidenceDto({
      title: 'Title2',
      description: 'Description2',
      fileUrl: 'https://example.com/file2',
    })
    const evidenceEntity1 = dbService.evidenceRepository.create(evidence1)
    const evidenceEntity2 = dbService.evidenceRepository.create(evidence2)

    await dbService.evidenceRepository.persistAndFlush([evidenceEntity1, evidenceEntity2])

    await service.deleteEvidenceById(evidence1.id)
    const res = await dbService.evidenceRepository.findAll()
    const res1 = res.find((r) => r.id === evidence1.id)
    const res2 = res.find((r) => r.id === evidence2.id)

    expect(res.length).toEqual(2)
    expect(res1).toMatchObject(evidence1)
    expect(res1.isDeleted).toEqual(true)
    expect(res2).toMatchObject(evidence2)
    expect(res2.isDeleted).toEqual(false)
  })
})
