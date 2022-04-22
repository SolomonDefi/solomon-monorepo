import { Progress, Upload } from '@aws-sdk/lib-storage'
import { S3Client } from '@aws-sdk/client-s3'

export class UploadService {
  toS3 = async (buffer: Buffer, region: string, bucketName: string, key: string) => {
    try {
      const uploader = new Upload({
        client: new S3Client({
          region: region,
        }),
        params: {
          Bucket: bucketName,
          Key: key,
          Body: buffer,
        },
      })

      uploader.on('httpUploadProgress', this.onS3UploadProgress)

      await uploader.done()

      return `https://${bucketName}.s3.amazonaws.com/${key}`
    } catch (e) {
      console.log(e)
      return null
    }
  }

  // for functional test
  onS3UploadProgress = (progress: Progress) => {
    return progress
  }
}

export const uploadService = new UploadService()
