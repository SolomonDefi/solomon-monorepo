import supertest from 'supertest'
import { stringHelper } from '@solomon/blockchain-watcher/feature-app'
import { v4 } from 'uuid'

jest.setTimeout(60 * 1000)

const generateSignature = (data: Record<string, unknown>): string => {
  const body = JSON.stringify(data)
  const signature = stringHelper.generateDisputeApiSignature(
    'bpNL2QWDZwJhuF-kJCBnB_jIDDuZ4ODzBTPoaXSjVNU',
    body,
  )
  return signature
}

describe('api-dispute', () => {
  let api: supertest.SuperTest<supertest.Test>
  let apiSignature: string

  beforeAll(() => {
    api = supertest('http://127.0.0.1:3000')
  })

  it('Health check responds with 200 code', () => {
    return api.get('/api/health/app').expect(200)
  })

  it('Ping response with 200 code', () => {
    const payload = {}
    apiSignature = generateSignature(payload)
    return api
      .post('/api/events/ping')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(200)
  })

  it('/api/events dispute.preorder.created returns 200', () => {
    const payload = {
      id: v4(),
      type: 'dispute.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/events/dispute.preorder.created')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(200)
  })

  it('/api/events Invalid type returns error response', () => {
    const payload = {
      id: v4(),
      type: 'invalid_type',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/events/dispute.preorder.created')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(422)
  })

  it('/api/events dispute.preorder.created invalid party1 returns error response', () => {
    const payload = {
      id: v4(),
      type: 'dispute.preorder.created',
      party1: 'Invalid address',
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/events/dispute.preorder.created')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(422) // TODO -- Should this be 400?
  })

  it('/api/events dispute.preorder.created invalid party2 returns error response', () => {
    const payload = {
      id: v4(),
      type: 'dispute.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: 'Invalid address',
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/events/dispute.preorder.created')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(422)
  })

  it('/api/events dispute.preorder.created invalid contract returns error response', () => {
    const payload = {
      id: v4(),
      type: 'dispute.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: 'Invalid address',
      judgeContract: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/events/dispute.preorder.created')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(422)
  })

  it('/api/events dispute.preorder.created invalid judgeContract returns error response', () => {
    const payload = {
      id: v4(),
      type: 'dispute.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: 'Invalid address',
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/events/dispute.preorder.created')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(422)
  })

  it('/api/events dispute.preorder.completed returns 200 response', () => {
    const party1 = stringHelper.generateRandomEthAddr()
    const payload = {
      id: v4(),
      type: 'dispute.preorder.completed',
      party1: party1,
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      awardedTo: party1,
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/events/dispute.preorder.completed')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(200)
  })

  it('/api/events dispute.preorder.completed invalid party1 returns error response', () => {
    const payload = {
      id: v4(),
      type: 'dispute.preorder.completed',
      party1: 'Invalid address',
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      awardedTo: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/events/dispute.preorder.completed')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(422)
  })

  it('/api/events dispute.preorder.completed invalid party2 returns error response', () => {
    const payload = {
      id: v4(),
      type: 'dispute.preorder.completed',
      party1: stringHelper.generateRandomEthAddr(),
      party2: 'Invalid address',
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      awardedTo: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/events/dispute.preorder.completed')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(422)
  })

  it('/api/events dispute.preorder.completed invalid contract returns error response', () => {
    const payload = {
      id: v4(),
      type: 'dispute.preorder.completed',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: 'Invalid address',
      judgeContract: stringHelper.generateRandomEthAddr(),
      awardedTo: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/events/dispute.preorder.completed')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(422)
  })

  it('/api/events dispute.preorder.completed invalid judgeContract returns error message', () => {
    const payload = {
      id: v4(),
      type: 'dispute.preorder.completed',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: 'Invalid address',
      awardedTo: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/events/dispute.preorder.completed')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(422)
  })

  it('/api/events dispute.preorder.completed invalid awardedTo returns error message', () => {
    const payload = {
      id: v4(),
      type: 'dispute.preorder.completed',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      awardedTo: 'Invalid address',
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/events/dispute.preorder.completed')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(422)
  })

  it('/api/events evidence.preorder.submitted returns 200 response', () => {
    const party1 = stringHelper.generateRandomEthAddr()
    const payload = {
      id: v4(),
      type: 'evidence.preorder.submitted',
      party1: party1,
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      evidenceUrl: '',
      submitter: party1,
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/events/evidence.preorder.submitted')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(200)
  })

  it('/api/events evidence.preorder.submitted invalid party1 returns error message', () => {
    const payload = {
      id: v4(),
      type: 'evidence.preorder.submitted',
      party1: 'Invalid address',
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      submitter: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/events/evidence.preorder.submitted')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(422)
  })

  it('/api/events evidence.preorder.submitted invalid party2 returns error message', () => {
    const payload = {
      id: v4(),
      type: 'evidence.preorder.submitted',
      party1: stringHelper.generateRandomEthAddr(),
      party2: 'Invalid address',
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      submitter: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/events/evidence.preorder.submitted')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(422)
  })

  it('/api/events evidence.preorder.submitted invalid contract returns error message', () => {
    const payload = {
      id: v4(),
      type: 'evidence.preorder.submitted',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: 'Invalid address',
      judgeContract: stringHelper.generateRandomEthAddr(),
      submitter: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/events/evidence.preorder.submitted')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(422)
  })

  it('/api/events evidence.preorder.submitted invalid judgeContract returns error message', () => {
    const payload = {
      id: v4(),
      type: 'evidence.preorder.submitted',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: 'Invalid address',
      submitter: stringHelper.generateRandomEthAddr(),
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/events/evidence.preorder.submitted')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(422)
  })

  it('/api/events evidence.preorder.submitted invalid submitter returns error message', () => {
    const payload = {
      id: v4(),
      type: 'evidence.preorder.submitted',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      submitter: 'Invalid address',
    }
    apiSignature = generateSignature(payload)

    return api
      .post('/api/events/evidence.preorder.submitted')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(422)
  })

  it('/api/events payment.preorder.created returns 200 response', () => {
    const payload = {
      id: v4(),
      type: 'payment.preorder.created',
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
      .post('/api/events/payment.preorder.created')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(200)
  })

  it('/api/events payment.preorder.created invalid party1 returns error message', () => {
    const payload = {
      id: v4(),
      type: 'payment.preorder.created',
      party1: 'Invalid address',
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: 40,
      ethPaid: '1000000',
    }

    return api
      .post('/api/events/payment.preorder.created')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/events payment.preorder.created invalid party2 returns error message', () => {
    const payload = {
      id: v4(),
      type: 'payment.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: 'Invalid address',
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: 40,
      ethPaid: '1000000',
    }

    return api
      .post('/api/events/payment.preorder.created')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/events payment.preorder.created invalid contract returns error message', () => {
    const payload = {
      id: v4(),
      type: 'payment.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: 'Invalid address',
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: 40,
      ethPaid: '1000000',
    }

    return api
      .post('/api/events/payment.preorder.created')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/events payment.preorder.created invalid judgeContract returns error message', () => {
    const payload = {
      id: v4(),
      type: 'payment.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: 'Invalid address',
      token: stringHelper.generateRandomEthAddr(),
      discount: 40,
      ethPaid: '1000000',
    }

    return api
      .post('/api/events/payment.preorder.created')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/events payment.preorder.created invalid token returns error message', () => {
    const payload = {
      id: v4(),
      type: 'payment.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: 'Invalid address',
      discount: 40,
      ethPaid: '1000000',
    }

    return api
      .post('/api/events/payment.preorder.created')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/events payment.preorder.created invalid discount -1 returns error message', () => {
    const payload = {
      id: v4(),
      type: 'payment.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: -1,
      ethPaid: '1000000',
    }

    return api
      .post('/api/events/payment.preorder.created')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/events payment.preorder.created invalid discount 101 returns error message', () => {
    const payload = {
      id: v4(),
      type: 'payment.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: 101,
      ethPaid: '1000000',
    }

    return api
      .post('/api/events/payment.preorder.created')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })

  it('/api/events payment.preorder.created invalid ethPaid -1 returns error message', () => {
    const payload = {
      id: v4(),
      type: 'payment.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: 101,
      ethPaid: '-1',
    }

    return api
      .post('/api/events/payment.preorder.created')
      .set('X-Signature', apiSignature)
      .send(payload)
      .expect(400)
  })
})
