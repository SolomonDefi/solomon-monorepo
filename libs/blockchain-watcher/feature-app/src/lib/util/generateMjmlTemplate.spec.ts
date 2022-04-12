import { generateMjmlTemplate } from './generateMjmlTemplate'

describe('blockchain watcher generate templates', () => {
  it('should work', async () => {
    expect(await generateMjmlTemplate()).toBe(true)
  })
})
