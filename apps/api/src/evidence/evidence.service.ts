import { Injectable } from '@nestjs/common'
import { EvidenceResult } from '@solomon/shared/util-klass'
import { envStore } from '@solomon/shared/store-env'
import { EvidenceDto } from '@solomon/shared/util-klass'
import { evidenceDbService } from '@solomon/backend/service-db'
import { uploadService } from '@solomon/backend/service-upload'

@Injectable()
export class EvidenceService {
  async addEvidence(evidence: EvidenceDto, fileBuffer: Buffer) {
    const s3Url = await uploadService.toS3(
      fileBuffer,
      envStore.s3Region,
      'evidence',
      evidence.id,
    )

    evidence.fileUrl = s3Url
    await evidenceDbService.createEvidences([evidence])
  }

  async getEvidenceById(id: string): Promise<EvidenceResult> {
    let entities = await evidenceDbService.getEvidenceByIds([id])

    return entities.map((entity) => new EvidenceResult(entity))[0]
  }

  async updateEvidence(evidence: EvidenceDto, fileBuffer?: Buffer) {
    if (fileBuffer) {
      const s3Url = await uploadService.toS3(
        fileBuffer,
        envStore.s3Region,
        'evidence',
        evidence.id,
      )
      evidence.fileUrl = s3Url
    }

    await evidenceDbService.updateEvidences([evidence])
  }

  async deleteEvidenceById(id: string) {
    await evidenceDbService.deleteEvidenceByIds([id])
  }
}
