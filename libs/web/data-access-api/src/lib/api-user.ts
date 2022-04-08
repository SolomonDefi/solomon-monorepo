import { plainToClass } from 'class-transformer'
import { PrivateProfileApiResponse } from '@solomon/shared/util-api-evidence-types'
import { WebApi } from './api'

export const useUserApi = (api: WebApi) => {
  const getProfilePrivate = async () => {
    const { data } = await api.authRequest({
      url: 'user',
      method: 'GET',
    })
    return plainToClass(PrivateProfileApiResponse, data)
  }

  return {
    getProfilePrivate,
  }
}
