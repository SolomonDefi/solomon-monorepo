import pathStore from './path-store'

describe('sharedUtilPathStore', () => {
  it('should work', () => {
    expect(pathStore.mailer).toContain('blockchain-mailer')
  })
})
