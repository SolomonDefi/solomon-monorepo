import { WebApi } from '@solomon/web/data-access-api'

const apiHost = import.meta.env.VITE_API_HOST

export const API_URL = `${apiHost}/api/`

export const evidenceApi = new WebApi({
  baseUrl: API_URL,
})
