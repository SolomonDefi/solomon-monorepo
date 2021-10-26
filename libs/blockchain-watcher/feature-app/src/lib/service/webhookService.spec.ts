import { WebhookService, webhookService } from './webhookService'

describe('webhookService', () => {
  it('constructor()', async () => {
    expect(webhookService).toBeInstanceOf(WebhookService)
  })
})
