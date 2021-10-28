import { DeliverService, deliverService } from './deliverService'

describe('deliverService', async () => {
  it('constructor()', async () => {
    expect(deliverService).toBeInstanceOf(DeliverService)
  })
})
