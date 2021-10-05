import { FetchApi, FetchApiOptions, FetchRequestConfig } from '@sampullman/vue3-fetch-api'
import { ApiResponse } from '@solomon/shared/util-api-evidence-types'
import { IJsonObject } from '@solomon/shared/util-core'

const defaultResponseInterceptors = [
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
    let data: IJsonObject
    try {
      data = await res.json()
    } catch (_e) {
      // Avoid crashing on empty response
      data = {}
    }

    if (status === 400) {
      throw data
    }
    const apiRes = res as ApiResponse
    apiRes.data = data
    return apiRes
  },
]

export class NftApi extends FetchApi {
  constructor(options: FetchApiOptions) {
    super({
      responseInterceptors: defaultResponseInterceptors,
      ...options,
    })
  }

  authRequest(config: FetchRequestConfig): Promise<ApiResponse> {
    // TODO -- use real auth strategy
    const token = 'test'
    const { headers, ...rest } = config
    return this.request({
      ...rest,
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    }) as Promise<ApiResponse>
  }
}
