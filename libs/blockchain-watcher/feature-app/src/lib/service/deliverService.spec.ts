import { DeliverService, deliverService } from './deliverService'

describe('deliverService', () => {
  it('constructor()', async () => {
    expect(deliverService).toBeInstanceOf(DeliverService)
  })
})
