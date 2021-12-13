import fetch from 'node-fetch'
import FormData from 'form-data'
import { readFile } from 'node:fs/promises'
import path from 'path'
import { pathStore } from '@solomon/shared/util-path-store'
import { envStore, stringHelper } from '@solomon/blockchain-watcher/feature-app'

describe('api-evidence', () => {
  it('GET /api/health/app', async () => {
    let fetched = await fetch('http://127.0.0.1:3010/api/health/app')

    expect(fetched.ok).toEqual(true)
  })

  it('POST /api/evidence', async () => {
    const formData = new FormData()
    const fileBuffer = await readFile(
      path.resolve(pathStore.e2e, 'assets', 'wtm_256x256.jpg'),
    )

    formData.append('title', 'A title')
    formData.append('description', 'Some description')
    formData.append('evidence_file', fileBuffer, {
      contentType: 'image/jpg',
      filename: 'wtm_256x256.jpg',
    })

    const fetched = await fetch('http://127.0.0.1:3010/api/evidence', {
      method: 'post',
      body: formData,
    })

    expect(fetched.ok).toEqual(true)
  })

  it('POST /api/evidence no title', async () => {
    const formData = new FormData()
    const fileBuffer = await readFile(
      path.resolve(pathStore.e2e, 'assets', 'wtm_256x256.jpg'),
    )

    formData.append('description', 'Some description')
    formData.append('evidence_file', fileBuffer, {
      contentType: 'image/jpg',
      filename: 'wtm_256x256.jpg',
    })

    const fetched = await fetch('http://127.0.0.1:3010/api/evidence', {
      method: 'post',
      body: formData,
    })

    expect(fetched.ok).toEqual(false)
  })

  it('POST /api/evidence no description', async () => {
    const formData = new FormData()
    const fileBuffer = await readFile(
      path.resolve(pathStore.e2e, 'assets', 'wtm_256x256.jpg'),
    )

    formData.append('title', 'A title')
    formData.append('evidence_file', fileBuffer, {
      contentType: 'image/jpg',
      filename: 'wtm_256x256.jpg',
    })

    const fetched = await fetch('http://127.0.0.1:3010/api/evidence', {
      method: 'post',
      body: formData,
    })

    expect(fetched.ok).toEqual(false)
  })

  it('POST /api/evidence no file', async () => {
    const formData = new FormData()

    formData.append('title', 'A title')
    formData.append('description', 'Some description')

    const fetched = await fetch('http://127.0.0.1:3010/api/evidence', {
      method: 'post',
      body: formData,
    })

    expect(fetched.ok).toEqual(false)
  })

  it('GET /api/evidence', async () => {})

  it('GET /api/evidence/:id', async () => {})

  it('POST /api/users', async () => {
    const password = 'my_pass_word'
    const email = 'john.doe@example.com'
    const fullName = 'John Doe'
    const body = JSON.stringify({
      password: password,
      email: email,
      full_name: fullName,
    })
    const signature = stringHelper.generateDisputeApiSignature(
      envStore.disputeApiSecretKey,
      body,
    )

    const fetched = await fetch('http://127.0.0.1:3010/api/users', {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
        'X-Signature': signature,
      },
      body: body,
    })
    const json = fetched.json()

    expect(fetched.ok).toEqual(true)
    expect(fetched.status).toEqual(200)
    expect(json['email']).toEqual(email)
    expect(json['is_active']).toEqual(true)
    expect(json['is_superuser']).toEqual(false)
    expect(json['full_name']).toEqual(fullName)
    expect(stringHelper.isEthAddress(json['eth_address'])).toEqual(true)
    expect(typeof json['id']).toEqual('number')
  })
})
