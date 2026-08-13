const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');
const { env } = require('./env');

let dynamoDocClient;
let s3Client;

function hasCredentialSource() {
  return Boolean(
    (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) ||
    env.AWS_PROFILE ||
    env.AWS_ROLE_ARN ||
    env.AWS_WEB_IDENTITY_TOKEN_FILE ||
    env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI ||
    env.AWS_USE_IAM_ROLE === 'true'
  );
}

function isDynamoConfigured() {
  return Boolean(env.AWS_REGION && hasCredentialSource());
}

function isS3Configured() {
  return Boolean(env.AWS_REGION && env.AWS_S3_BUCKET && hasCredentialSource());
}

function getDynamoClient() {
  if (!dynamoDocClient) {
    const client = new DynamoDBClient({ region: env.AWS_REGION || 'us-east-1' });
    dynamoDocClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertClassInstanceToMap: true
      }
    });
  }
  return dynamoDocClient;
}

function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({ region: env.AWS_REGION || 'us-east-1' });
  }
  return s3Client;
}

function getTableName(entity) {
  const key = `AWS_DYNAMODB_${entity.toUpperCase()}_TABLE`;
  return env[key] || `${env.AWS_DYNAMODB_TABLE_PREFIX}_${entity}`;
}

async function initializeDataServices() {
  if (!isDynamoConfigured()) {
    console.warn('DynamoDB connection skipped: AWS_REGION and AWS credential source are not fully configured.');
  } else {
    console.log(`DynamoDB configured for region ${env.AWS_REGION}`);
  }

  if (!isS3Configured()) {
    console.warn('S3 storage skipped: AWS_S3_BUCKET or AWS credential source is not configured.');
  } else {
    console.log(`S3 configured for bucket ${env.AWS_S3_BUCKET}`);
  }
}

module.exports = {
  getDynamoClient,
  getS3Client,
  getTableName,
  initializeDataServices,
  isDynamoConfigured,
  isS3Configured
};
