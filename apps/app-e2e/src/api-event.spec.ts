import supertest from 'supertest'
import { v4 } from 'uuid'
import { stringHelper } from '@solomon/shared/util-helper'
import { envStore } from '@solomon/shared/store-env'
import {
  IBaseEvent,
  IDisputeCompleteEvent,
  IDisputeCreatedEvent,
  IEvidenceSubmittedEvent,
  IPaymentCreatedEvent,
} from '@solomon/shared/util-interface'
import { EnumEventType } from '@solomon/shared/util-enum'

jest.setTimeout(60 * 1000)

const generateSignature = (data: unknown): string => {
  const body = JSON.stringify(data)
  const signature = stringHelper.generateApiSignature(envStore.apiSecret, body)
  return signature
}

describe('api-dispute', () => {
  let api: supertest.SuperTest<supertest.Test>
  let apiSignature: string

  beforeAll(() => {
    api = supertest('http://127.0.0.1:3333')
  })

  it('/api/event Invalid type returns error response', () => {
    const payload: IBaseEvent = {
      id: v4(),
      type: 'invalid_type' as any,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event disputeCreated returns 200', () => {
    const payload: IDisputeCreatedEvent = {
      id: v4(),
      type: EnumEventType.preorderDisputeCreated,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(200)
  })

  it('/api/event disputeCreated invalid party1 returns error response', () => {
    const payload: IDisputeCreatedEvent = {
      id: v4(),
      type: EnumEventType.preorderDisputeCreated,
      party1: 'Invalid address',
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event disputeCreated invalid party2 returns error response', () => {
    const payload: IDisputeCreatedEvent = {
      id: v4(),
      type: EnumEventType.preorderDisputeCreated,
      party1: stringHelper.generateRandomEthAddr(),
      party2: 'Invalid address',
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event disputeCreated invalid contract returns error response', () => {
    const payload: IDisputeCreatedEvent = {
      id: v4(),
      type: EnumEventType.preorderDisputeCreated,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: 'Invalid address',
      judgeContract: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event disputeCreated invalid judgeContract returns error response', () => {
    const payload: IDisputeCreatedEvent = {
      id: v4(),
      type: EnumEventType.preorderDisputeCreated,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: 'Invalid address',
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event disputeCreated returns 200 response', () => {
    const party1 = stringHelper.generateRandomEthAddr()
    const payload: IDisputeCompleteEvent = {
      id: v4(),
      type: EnumEventType.preorderDisputeComplete,
      party1: party1,
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      awardedTo: party1,
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(200)
  })

  it('/api/event disputeCreated invalid party1 returns error response', () => {
    const payload: IDisputeCompleteEvent = {
      id: v4(),
      type: EnumEventType.preorderDisputeComplete,
      party1: 'Invalid address',
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      awardedTo: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event disputeCreated invalid party2 returns error response', () => {
    const payload: IDisputeCompleteEvent = {
      id: v4(),
      type: EnumEventType.preorderDisputeComplete,
      party1: stringHelper.generateRandomEthAddr(),
      party2: 'Invalid address',
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      awardedTo: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event disputeCreated invalid contract returns error response', () => {
    const payload: IDisputeCompleteEvent = {
      id: v4(),
      type: EnumEventType.preorderDisputeComplete,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: 'Invalid address',
      judgeContract: stringHelper.generateRandomEthAddr(),
      awardedTo: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event disputeCreated invalid judgeContract returns error message', () => {
    const payload: IDisputeCompleteEvent = {
      id: v4(),
      type: EnumEventType.preorderDisputeComplete,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: 'Invalid address',
      awardedTo: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event disputeCreated invalid awardedTo returns error message', () => {
    const payload: IDisputeCompleteEvent = {
      id: v4(),
      type: EnumEventType.preorderDisputeComplete,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      awardedTo: 'Invalid address',
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event evidenceSubmitted returns 200 response', () => {
    const party1 = stringHelper.generateRandomEthAddr()
    const payload: IEvidenceSubmittedEvent = {
      id: v4(),
      type: EnumEventType.preorderEvidenceSubmitted,
      party1: party1,
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      evidenceUrl: 'http://foo.bar',
      submitter: party1,
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(200)
  })

  it('/api/event evidenceSubmitted invalid party1 returns error message', () => {
    const payload: IEvidenceSubmittedEvent = {
      id: v4(),
      type: EnumEventType.preorderEvidenceSubmitted,
      party1: 'Invalid address',
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      evidenceUrl: 'http://foo.bar',
      submitter: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event evidenceSubmitted invalid party2 returns error message', () => {
    const payload: IEvidenceSubmittedEvent = {
      id: v4(),
      type: EnumEventType.preorderEvidenceSubmitted,
      party1: stringHelper.generateRandomEthAddr(),
      party2: 'Invalid address',
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      evidenceUrl: 'http://foo.bar',
      submitter: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event evidenceSubmitted invalid contract returns error message', () => {
    const payload: IEvidenceSubmittedEvent = {
      id: v4(),
      type: EnumEventType.preorderEvidenceSubmitted,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: 'Invalid address',
      judgeContract: stringHelper.generateRandomEthAddr(),
      evidenceUrl: 'http://foo.bar',
      submitter: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event evidenceSubmitted invalid judgeContract returns error message', () => {
    const payload: IEvidenceSubmittedEvent = {
      id: v4(),
      type: EnumEventType.preorderEvidenceSubmitted,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: 'Invalid address',
      evidenceUrl: 'http://foo.bar',
      submitter: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event evidenceSubmitted invalid submitter returns error message', () => {
    const payload: IEvidenceSubmittedEvent = {
      id: v4(),
      type: EnumEventType.preorderEvidenceSubmitted,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      evidenceUrl: 'http://foo.bar',
      submitter: 'Invalid address',
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event paymentCreated returns 200 response', () => {
    const payload: IPaymentCreatedEvent = {
      id: v4(),
      type: EnumEventType.preorderPaymentCreated,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: 40,
      ethPaid: '1000000',
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(200)
  })

  it('/api/event paymentCreated invalid party1 returns error message', () => {
    const payload: IPaymentCreatedEvent = {
      id: v4(),
      type: EnumEventType.preorderPaymentCreated,
      party1: 'Invalid address',
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: 40,
      ethPaid: '1000000',
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event paymentCreated invalid party2 returns error message', () => {
    const payload: IPaymentCreatedEvent = {
      id: v4(),
      type: EnumEventType.preorderPaymentCreated,
      party1: stringHelper.generateRandomEthAddr(),
      party2: 'Invalid address',
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: 40,
      ethPaid: '1000000',
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event paymentCreated invalid contract returns error message', () => {
    const payload: IPaymentCreatedEvent = {
      id: v4(),
      type: EnumEventType.preorderPaymentCreated,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: 'Invalid address',
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: 40,
      ethPaid: '1000000',
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event paymentCreated invalid judgeContract returns error message', () => {
    const payload: IPaymentCreatedEvent = {
      id: v4(),
      type: EnumEventType.preorderPaymentCreated,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: 'Invalid address',
      token: stringHelper.generateRandomEthAddr(),
      discount: 40,
      ethPaid: '1000000',
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event paymentCreated invalid token returns error message', () => {
    const payload: IPaymentCreatedEvent = {
      id: v4(),
      type: EnumEventType.preorderPaymentCreated,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: 'Invalid address',
      discount: 40,
      ethPaid: '1000000',
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event paymentCreated invalid discount -1 returns error message', () => {
    const payload: IPaymentCreatedEvent = {
      id: v4(),
      type: EnumEventType.preorderPaymentCreated,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: -1,
      ethPaid: '1000000',
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event paymentCreated invalid discount 101 returns error message', () => {
    const payload: IPaymentCreatedEvent = {
      id: v4(),
      type: EnumEventType.preorderPaymentCreated,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: 101,
      ethPaid: '1000000',
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/event paymentCreated invalid ethPaid abc returns error message', () => {
    const payload: IPaymentCreatedEvent = {
      id: v4(),
      type: EnumEventType.preorderPaymentCreated,
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: 0,
      ethPaid: '-1',
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/event')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })
})
