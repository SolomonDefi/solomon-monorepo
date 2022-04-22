import supertest from 'supertest'
import { envStore } from '@solomon/shared/store-env'
import { mockClient, mockLibStorageUpload } from 'aws-sdk-client-mock'
import { S3Client } from '@aws-sdk/client-s3'
/*import FormData from 'form-data'
import { readFile } from 'node:fs/promises'
import path from 'path'
import { pathStore } from "@solomon/shared/store-path";
import fetch from 'node-fetch'*/

describe('api /evidence', () => {
  const api = supertest(`http://127.0.0.1:${envStore.apiPort}`)
  const s3ClientMock = mockClient(S3Client)
  mockLibStorageUpload(s3ClientMock)

  beforeEach(async () => {
    // TODO: reset database here
  })

  // TODO: need a real s3 to implement "E2E" tests
  it('placeholder', () => {})
  /*
  it('POST /api/evidence', async () => {
    const formData = new FormData()
    const fileBuffer = await readFile(
      path.resolve(pathStore.e2e, 'assets', 'wtm_256x256.jpg'),
    )

    formData.append('title', 'A title')
    formData.append('description', 'Some description')
    formData.append('file', fileBuffer, {
      contentType: 'image/jpg',
      filename: 'wtm_256x256.jpg',
    })

    const fetched = await fetch(`http://127.0.0.1:${envStore.apiPort}/api/evidence`, {
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
  */
})
