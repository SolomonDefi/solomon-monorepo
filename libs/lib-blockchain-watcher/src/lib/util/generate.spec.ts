import { generateMjmlTemplate } from '@solomon/lib-blockchain-watcher'

describe('blockchain watcher generate templates', () => {
  it('should work', async () => {
    expect(await generateMjmlTemplate()).toBe(true)
  })
})
