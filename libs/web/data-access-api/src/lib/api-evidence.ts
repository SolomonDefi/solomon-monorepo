import { EvidenceApiResponse } from '@solomon/shared/util-api-evidence-types'
import { WebApi } from './api'

export const useEvidenceApi = (api: WebApi) => {
  const uploadEvidenceFile = async (file: File): Promise<EvidenceApiResponse> => {
    const { data } = await api.authRequest({
      url: 'evidence',
      method: 'POST',
      data: file,
    })
    return data as unknown as EvidenceApiResponse
  }

  return {
    uploadEvidenceFile,
  }
}
