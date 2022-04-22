import { EvidenceEntity } from '../entity/EvidenceEntity'
import { EvidenceDto } from '@solomon/shared/util-klass'
import { dbService } from './dbService'

export class EvidenceDbService {
  async createEvidences(evidences: EvidenceDto[]) {
    for (const evidence of evidences) {
      const entity = dbService.evidenceRepository.create(evidence)
      entity.createDate = new Date()
      entity.updateDate = new Date()
      await dbService.evidenceRepository.persist(entity)
    }

    await dbService.evidenceRepository.flush()
  }

  async getEvidenceByIds(ids: string[]): Promise<EvidenceEntity[]> {
    const entities = await dbService.evidenceRepository.find({
      id: {
        $in: ids,
      },
      isDeleted: false,
    })

    return entities
  }

  async updateEvidences(evidences: EvidenceDto[]) {
    for (const evidence of evidences) {
      const entity = await dbService.evidenceRepository.findOne({ id: evidence.id })
      entity.updateDate = new Date()
      dbService.evidenceRepository.assign(entity, evidence)
    }

    await dbService.evidenceRepository.flush()
  }

  async deleteEvidenceByIds(ids: string[]) {
    const entities = await dbService.evidenceRepository.find({
      id: {
        $in: ids,
      },
    })

    for (const entity of entities) {
      dbService.evidenceRepository.assign(entity, {
        isDeleted: true,
        deleteDate: new Date(),
      })
    }

    await dbService.evidenceRepository.flush()
  }
}

export const evidenceDbService = new EvidenceDbService()
