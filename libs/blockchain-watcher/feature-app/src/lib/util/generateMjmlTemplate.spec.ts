import { generateMjmlTemplate } from '@solomon/blockchain-watcher/feature-app'

describe('blockchain watcher generate templates', () => {
  it('should work', async () => {
    expect(await generateMjmlTemplate()).toBe(true)
  })
})
