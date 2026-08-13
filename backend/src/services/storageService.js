const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { env } = require('../config/env');
const { getS3Client, isS3Configured } = require('../config/aws');
const { ApiError } = require('../utils/apiError');

async function uploadFile({ key, body, contentType }) {
  if (!isS3Configured()) {
    throw new ApiError(503, 'S3 is not configured. Set AWS_S3_BUCKET, AWS_REGION, and AWS credentials/IAM role.');
  }

  await getS3Client().send(new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType
  }));

  if (env.AWS_S3_PUBLIC_BASE_URL) {
    return `${env.AWS_S3_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`;
  }

  return `s3://${env.AWS_S3_BUCKET}/${key}`;
}

module.exports = { uploadFile };
