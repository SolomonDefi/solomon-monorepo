import { v4 } from 'uuid'
import { EvidenceDbService, evidenceDbService } from './evidenceDbService'
import { EvidenceDto } from '@solomon/shared/util-klass'
import { dbService } from './dbService'

describe('evidenceDbService', () => {
  beforeAll(async () => {
    await dbService.init()
  })

  beforeEach(async () => {
    await dbService.resetForTest()
  })

  afterAll(async () => {
    await dbService.close(true)
  })

  it('constructor()', () => {
    expect(evidenceDbService).toBeInstanceOf(EvidenceDbService)
  })

  it('createEvidences()', async () => {
    const evidence1 = new EvidenceDto({
      id: v4(),
      title: 'Title1',
      description: 'Desc1',
      fileUrl: 'https://example.com/file/1',
    })
    const evidence2 = new EvidenceDto({
      id: v4(),
      title: 'Title2',
      description: 'Desc2',
      fileUrl: 'https://example.com/file/2',
    })

    await evidenceDbService.createEvidences([evidence1, evidence2])

    const res = await dbService.evidenceRepository.findAll()

    expect(res[0]).toMatchObject(evidence1)
    expect(res[1]).toMatchObject(evidence2)
    expect(res[0].createDate.getTime()).toBeGreaterThan(0)
    expect(res[1].createDate.getTime()).toBeGreaterThan(0)
    expect(res[0].updateDate.getTime()).toBeGreaterThan(0)
    expect(res[1].updateDate.getTime()).toBeGreaterThan(0)
  })

  it('getEvidenceByIds()', async () => {
    const evidence1 = new EvidenceDto({
      id: v4(),
      title: 'Title1',
      description: 'Desc1',
      fileUrl: 'https://example.com/file/1',
    })
    const evidence2 = new EvidenceDto({
      id: v4(),
      title: 'Title2',
      description: 'Desc2',
      fileUrl: 'https://example.com/file/2',
    })
    const evidence3 = new EvidenceDto({
      id: v4(),
      title: 'Title3',
      description: 'Desc3',
      fileUrl: 'https://example.com/file/3',
    })
    const evidenceEntity1 = dbService.evidenceRepository.create(evidence1)
    const evidenceEntity2 = dbService.evidenceRepository.create(evidence2)
    const evidenceEntity3 = dbService.evidenceRepository.create(evidence3)

    evidenceEntity3.isDeleted = true

    await dbService.evidenceRepository.persist([
      evidenceEntity1,
      evidenceEntity2,
      evidenceEntity3,
    ])

    const res = await evidenceDbService.getEvidenceByIds([evidence1.id])

    expect(res[0]).toMatchObject(evidence1)

    const res2 = await evidenceDbService.getEvidenceByIds([evidence3.id])

    expect(res2.length).toEqual(0)
  })

  it('updateEvidences()', async () => {
    const evidence1 = new EvidenceDto({
      id: v4(),
      title: 'Title1',
      description: 'Desc1',
      fileUrl: 'https://example.com/file/1',
    })
    const evidence2 = new EvidenceDto({
      id: v4(),
      title: 'Title2',
      description: 'Desc2',
      fileUrl: 'https://example.com/file/2',
    })
    const evidenceEntity1 = dbService.evidenceRepository.create(evidence1)
    const evidenceEntity2 = dbService.evidenceRepository.create(evidence2)

    await dbService.evidenceRepository.persist([evidenceEntity1, evidenceEntity2])

    const beforeUpdateTime = Math.floor(Date.now() / 1000) * 1000
    evidence2.title = 'Changed'
    await evidenceDbService.updateEvidences([evidence2])

    const res = await dbService.evidenceRepository.findAll()
    const r1 = res.find((r) => r.id === evidence1.id)
    const r2 = res.find((r) => r.id === evidence2.id)

    expect(r1).toMatchObject(evidence1)
    expect(r2).toMatchObject(evidence2)
    expect(r2.updateDate.getTime()).toBeGreaterThanOrEqual(beforeUpdateTime)
  })

  it('deleteEvidenceByIds()', async () => {
    const evidence1 = new EvidenceDto({
      id: v4(),
      title: 'Title1',
      description: 'Desc1',
      fileUrl: 'https://example.com/file/1',
    })
    const evidence2 = new EvidenceDto({
      id: v4(),
      title: 'Title2',
      description: 'Desc2',
      fileUrl: 'https://example.com/file/2',
    })
    const evidence3 = new EvidenceDto({
      id: v4(),
      title: 'Title3',
      description: 'Desc3',
      fileUrl: 'https://example.com/file/3',
    })
    const evidenceEntity1 = dbService.evidenceRepository.create(evidence1)
    const evidenceEntity2 = dbService.evidenceRepository.create(evidence2)
    const evidenceEntity3 = dbService.evidenceRepository.create(evidence3)

    await dbService.evidenceRepository.persist([
      evidenceEntity1,
      evidenceEntity2,
      evidenceEntity3,
    ])

    const beforeDeleteTime = Math.floor(Date.now() / 1000) * 1000
    await evidenceDbService.deleteEvidenceByIds([evidence1.id, evidence2.id])

    const res = await dbService.evidenceRepository.findAll()
    const r1 = res.find((r) => r.id === evidence1.id)
    const r2 = res.find((r) => r.id === evidence2.id)
    const r3 = res.find((r) => r.id === evidence3.id)

    expect(r1.isDeleted).toEqual(true)
    expect(r2.isDeleted).toEqual(true)
    expect(r3.isDeleted).toEqual(false)
    expect(r1.deleteDate.getTime()).toBeGreaterThanOrEqual(beforeDeleteTime)
    expect(r2.deleteDate.getTime()).toBeGreaterThanOrEqual(beforeDeleteTime)
  })
})
