import { pathStore } from './pathStore'

describe('sharedUtilPathStore', () => {
  it('should work', () => {
    expect(pathStore.watcher).toContain('blockchain-watcher')
  })
})
