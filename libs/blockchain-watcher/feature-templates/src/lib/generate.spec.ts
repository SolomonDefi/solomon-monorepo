import generateMailTemplates from './generate'

describe('blockchain watcher generate templates', () => {
  it('should work', async () => {
    expect(await generateMailTemplates()).toBe(true)
  })
})
