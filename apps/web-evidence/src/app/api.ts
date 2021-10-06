import { FetchApi, FetchApiOptions } from '@sampullman/vue3-fetch-api'
import { API_URL } from './utils/config'
import { ApiResponse } from '@solomon/shared/util-api-evidence-types'

class NftApi extends FetchApi {
  constructor(options: FetchApiOptions) {
    super(options)
  }
}

export const api = new NftApi({
  baseUrl: API_URL,
  responseInterceptors: [
    async (res: Response): Promise<ApiResponse> => {
      if (!res) {
        throw new Error('NETWORK_FAILURE')
      }
      const { status } = res

      if (status >= 500) {
        throw new Error('NETWORK_FAILURE')
      } else if (status === 401) {
        // Permission denied
        throw res
      }
      let data: Record<string, unknown>
      try {
        data = await res.json()
      } catch (_e) {
        // Avoid crashing on empty response
        data = {}
      }

      if (status === 400) {
        throw data
      }
      res.data = data
      return res
    },
  ],
})
