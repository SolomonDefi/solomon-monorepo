import generateMailTemplates from './generate'

describe('blockchain mailer generate templates', () => {
  it('should work', async () => {
    expect(await generateMailTemplates()).toBe(true)
  })
})
