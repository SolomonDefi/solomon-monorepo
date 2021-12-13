import fetch, { Response } from 'node-fetch'
import { envStore, stringHelper } from '@solomon/blockchain-watcher/feature-app'
import { v4 } from 'uuid'

describe('api-dispute', () => {
  jest.setTimeout(60 * 1000)

  const doFetch = async (
    method: string,
    url: string,
    data: Record<string, unknown>,
  ): Promise<Response> => {
    const body = JSON.stringify(data)
    const signature = stringHelper.generateDisputeApiSignature(
      envStore.disputeApiSecretKey,
      body,
    )

    const fetched = await fetch(url, {
      method: method,
      headers: {
        'Content-type': 'application/json',
        'X-Signature': signature,
      },
      body: body,
    })

    return fetched
  }

  test('/api/health/app', async () => {
    const fetched = await fetch('http://127.0.0.1:3000/api/health/app')

    expect(fetched.ok).toEqual(true)
  })

  test('/api/events/ping', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events/ping', {})

    expect(fetched.ok).toEqual(true)
  })

  test('/api/events dispute.preorder.created', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'dispute.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
    })

    expect(fetched.ok).toEqual(true)
  })

  test('/api/events Invalid type', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'Invalid type',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events dispute.preorder.created invalid party1', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'dispute.preorder.created',
      party1: 'Invalid address',
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events dispute.preorder.created invalid party2', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'dispute.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: 'Invalid address',
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events dispute.preorder.created invalid contract', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'dispute.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: 'Invalid address',
      judgeContract: stringHelper.generateRandomEthAddr(),
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events dispute.preorder.created invalid judgeContract', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'dispute.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: 'Invalid address',
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events dispute.preorder.completed', async () => {
    const party1 = stringHelper.generateRandomEthAddr()
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'dispute.preorder.completed',
      party1: party1,
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      awardedTo: party1,
    })

    expect(fetched.ok).toEqual(true)
  })

  test('/api/events dispute.preorder.completed invalid party1', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'dispute.preorder.completed',
      party1: 'Invalid address',
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      awardedTo: stringHelper.generateRandomEthAddr(),
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events dispute.preorder.completed invalid party2', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'dispute.preorder.completed',
      party1: stringHelper.generateRandomEthAddr(),
      party2: 'Invalid address',
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      awardedTo: stringHelper.generateRandomEthAddr(),
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events dispute.preorder.completed invalid contract', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'dispute.preorder.completed',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: 'Invalid address',
      judgeContract: stringHelper.generateRandomEthAddr(),
      awardedTo: stringHelper.generateRandomEthAddr(),
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events dispute.preorder.completed invalid judgeContract', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'dispute.preorder.completed',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: 'Invalid address',
      awardedTo: stringHelper.generateRandomEthAddr(),
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events dispute.preorder.completed invalid awardedTo', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'dispute.preorder.completed',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      awardedTo: 'Invalid address',
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events evidence.preorder.submitted', async () => {
    const party1 = stringHelper.generateRandomEthAddr()
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'evidence.preorder.submitted',
      party1: party1,
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      evidenceUrl: '',
      submitter: party1,
    })

    expect(fetched.ok).toEqual(true)
  })

  test('/api/events evidence.preorder.submitted invalid party1', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'evidence.preorder.submitted',
      party1: 'Invalid address',
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      submitter: stringHelper.generateRandomEthAddr(),
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events evidence.preorder.submitted invalid party2', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'evidence.preorder.submitted',
      party1: stringHelper.generateRandomEthAddr(),
      party2: 'Invalid address',
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      submitter: stringHelper.generateRandomEthAddr(),
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events evidence.preorder.submitted invalid contract', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'evidence.preorder.submitted',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: 'Invalid address',
      judgeContract: stringHelper.generateRandomEthAddr(),
      submitter: stringHelper.generateRandomEthAddr(),
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events evidence.preorder.submitted invalid judgeContract', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'evidence.preorder.submitted',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: 'Invalid address',
      submitter: stringHelper.generateRandomEthAddr(),
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events evidence.preorder.submitted invalid submitter', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'evidence.preorder.submitted',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      submitter: 'Invalid address',
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events payment.preorder.created', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'payment.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: 40,
      ethPaid: '1000000',
    })

    expect(fetched.ok).toEqual(true)
  })

  test('/api/events payment.preorder.created invalid party1', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'payment.preorder.created',
      party1: 'Invalid address',
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: 40,
      ethPaid: '1000000',
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events payment.preorder.created invalid party2', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'payment.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: 'Invalid address',
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: 40,
      ethPaid: '1000000',
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events payment.preorder.created invalid contract', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'payment.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: 'Invalid address',
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: 40,
      ethPaid: '1000000',
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events payment.preorder.created invalid judgeContract', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'payment.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: 'Invalid address',
      token: stringHelper.generateRandomEthAddr(),
      discount: 40,
      ethPaid: '1000000',
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events payment.preorder.created invalid token', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'payment.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: 'Invalid address',
      discount: 40,
      ethPaid: '1000000',
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events payment.preorder.created invalid discount -1', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'payment.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: -1,
      ethPaid: '1000000',
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events payment.preorder.created invalid discount 101', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'payment.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: 101,
      ethPaid: '1000000',
    })

    expect(fetched.ok).toEqual(false)
  })

  test('/api/events payment.preorder.created invalid ethPaid -1', async () => {
    const fetched = await doFetch('POST', 'http://127.0.0.1:3000/api/events', {
      id: v4(),
      type: 'payment.preorder.created',
      party1: stringHelper.generateRandomEthAddr(),
      party2: stringHelper.generateRandomEthAddr(),
      contract: stringHelper.generateRandomEthAddr(),
      judgeContract: stringHelper.generateRandomEthAddr(),
      token: stringHelper.generateRandomEthAddr(),
      discount: 101,
      ethPaid: '-1',
    })

    expect(fetched.ok).toEqual(false)
  })
})
