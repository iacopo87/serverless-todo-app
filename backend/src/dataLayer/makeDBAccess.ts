import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const logger = createLogger('DBAccess')
const XAWS = AWSXRay.captureAWS(AWS)

export function makeDBAccess(
  s3 = new XAWS.S3({ signatureVersion: 'v4' }),
  bucketName = process.env.IMAGES_S3_BUCKET,
  urlExpiration = process.env.SIGNED_URL_EXPIRATION
) {
  const getUploadUrl = function (imageId: String): String {
    logger.info('Get Upload url', imageId)

    return s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: imageId,
      Expires: parseInt(urlExpiration, 10)
    })
  }

  return { getUploadUrl }
}
