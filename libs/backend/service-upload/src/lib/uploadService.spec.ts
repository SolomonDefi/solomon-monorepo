import { uploadService, UploadService } from './uploadService'
import { S3Client } from '@aws-sdk/client-s3'
import { mockClient, mockLibStorageUpload } from 'aws-sdk-client-mock'
import { Progress } from '@aws-sdk/lib-storage/dist-types/types'
import _ from 'lodash'

describe('uploadService', () => {
  it('constructor()', async () => {
    expect(uploadService).toBeInstanceOf(UploadService)
  })

  it('toS3()', async () => {
    const onProgressMock = jest.fn()
    const originOnProgressFn = uploadService.onS3UploadProgress
    uploadService.onS3UploadProgress = onProgressMock

    const s3ClientMock = mockClient(S3Client)
    mockLibStorageUpload(s3ClientMock)

    const buffer = Buffer.from('x'.repeat(12 * 1024 * 1024)) // 12MB
    const bucket = 'the-bucket'
    await uploadService.toS3(buffer, 'us-west', bucket, 'test')

    const progressArr: Progress[] = _.map(onProgressMock.mock.calls, (r) => r[0])

    expect(progressArr.length).toEqual(3)
    expect(progressArr[0].Bucket).toEqual(bucket)
    expect(progressArr[1].Bucket).toEqual(bucket)
    expect(progressArr[2].Bucket).toEqual(bucket)
    expect(progressArr[0].loaded).toBeLessThan(progressArr[1].loaded)
    expect(progressArr[1].loaded).toBeLessThan(progressArr[2].loaded)
    expect(progressArr[2].loaded).toEqual(buffer.length)

    uploadService.onS3UploadProgress = originOnProgressFn
  })
})
