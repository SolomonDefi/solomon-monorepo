import { computed, ComputedRef } from 'vue'
import { PrivateProfileApiResponse } from '@solomon/shared/util-api-evidence-types'
import { WebApi, useUserApi } from '@solomon/web/data-access-api'
import { StoreData, StoreApi } from './store'

export interface TxState {
  id: number
}

export interface NftState {
  id: number
}

export interface AuthState {
  token: string | null
}

export interface UserState {
  email: string | null
  avatar: string | null
  bio: string | null
  name: string | null
  joined: number | null
  auth: AuthState
  nfts: NftState[]
  txs: TxState[]
}

export interface UserStoreData extends StoreData {
  user: UserState
}

export interface UserStoreApi extends StoreApi<UserStoreData> {
  // getters
  token: ComputedRef<string | null>
  loggedIn: ComputedRef<boolean>
  avatar: ComputedRef<string | null>
  raw: UserStoreData
  // mutations
  updateUser: (userData: PrivateProfileApiResponse) => void
  // actions
  getPrivate(): Promise<void>
  logout(): void
}

export const useUserStoreApi = (api: WebApi, data: UserStoreData): UserStoreApi => {
  const userApi = useUserApi(api)

  const mutations = {
    updateUser(userData: PrivateProfileApiResponse): void {
      data.user = { ...data.user, ...userData }
    },
  }
  const actions = {
    async getPrivate(): Promise<void> {
      const user = await userApi.getProfilePrivate()
      mutations.updateUser(user)
    },
    logout() {
      data.user = { ...userInit().user }
    },
  }
  const getters = {
    avatar: computed(() => data.user.avatar),
    loggedIn: computed(() => !!data.user.auth.token),
    token: computed(() => data.user.auth.token),
    raw: data,
  }
  return {
    initialState: userInit,
    ...getters,
    ...mutations,
    ...actions,
  }
}

export const userInit = (): UserStoreData => ({
  user: {
    email: '',
    avatar: null,
    bio: '',
    name: '',
    joined: null,
    nfts: [],
    txs: [],
    auth: {
      token: null,
    },
  },
})
