import { reactive, watch } from 'vue'

export type StoreData = {
  version?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface StoreApi<DataType extends StoreData> {
  // Increment to clear data on start, to avoid broken app state
  initialState: () => DataType
}

export class Store<AppStoreApi extends StoreApi<DataType>, DataType extends StoreData> {
  name: string
  api: AppStoreApi
  data!: DataType

  constructor(name: string) {
    this.name = name
  }

  private initializeState(state: DataType) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.data = reactive<any>(state)
    this.save()
  }

  init(api: AppStoreApi) {
    this.api = api
    const raw = localStorage.getItem(this.name)
    const defaultState = this.api.initialState()
    if (!defaultState.version) {
      throw new Error('Store - version must exist in top level store')
    }
    if (raw) {
      const state = JSON.parse(raw) as DataType
      if (state.version !== defaultState.version) {
        console.log(`Store upgraded from ${state.version} to ${defaultState.version}`)
        this.initializeState(defaultState)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.data = reactive<any>(state)
      }
    } else {
      this.initializeState(defaultState)
    }

    watch(this.data, this.save)
  }

  save = () => {
    localStorage.setItem(this.name, JSON.stringify(this.data))
  }
}
