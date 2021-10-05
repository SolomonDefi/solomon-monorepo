import { Store } from './store'

describe('Store', () => {
  it('should work', () => {
    const name = 'store-test'
    const store = new Store(name)
    store.init({
      initialState: () => ({
        version: 1,
      }),
    })
    expect(store.name).toEqual(name)
    expect(store.data.version).toEqual(1)
  })
})
