import { plainToClass } from 'class-transformer'
import { EvidenceApiResponse } from '@solomon/shared/util-api-evidence-types'
import { NftApi } from './api'

export default (api: NftApi) => {
  const createEvidence = async (
    evidence: Record<string, unknown>,
  ): Promise<EvidenceApiResponse> => {
    const { data } = await api.authRequest({
      url: 'evidence',
      method: 'POST',
      data: evidence,
    })
    return plainToClass(EvidenceApiResponse, data)
  }

  return {
    createEvidence,
  }
}
