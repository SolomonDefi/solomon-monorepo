import pathStore from './path-store'

describe('sharedUtilPathStore', () => {
  it('should work', () => {
    expect(pathStore.watcher).toContain('blockchain-watcher')
  })
})
