const { DeleteCommand, GetCommand, PutCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { getDynamoClient, getTableName, isDynamoConfigured } = require('../config/aws');
const { ApiError } = require('../utils/apiError');

function normalizeAwsError(error) {
  const transientNames = [
    'CredentialsProviderError',
    'UnrecognizedClientException',
    'AccessDeniedException',
    'ResourceNotFoundException',
    'ExpiredTokenException'
  ];

  if (transientNames.includes(error.name)) {
    return new ApiError(503, `DynamoDB unavailable: ${error.message}`);
  }
  return error;
}

function ensureConfigured() {
  if (!isDynamoConfigured()) {
    throw new ApiError(503, 'DynamoDB is not configured. Set AWS_REGION and AWS credentials/IAM role to enable persistence.');
  }
}

function createRepository(entity) {
  const TableName = getTableName(entity);

  async function send(command) {
    ensureConfigured();
    try {
      return await getDynamoClient().send(command);
    } catch (error) {
      throw normalizeAwsError(error);
    }
  }

  return {
    tableName: TableName,

    async scan({ filterExpression, expressionAttributeNames, expressionAttributeValues, limit } = {}) {
      const result = await send(new ScanCommand({
        TableName,
        FilterExpression: filterExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        Limit: limit
      }));
      return result.Items || [];
    },

    async get(key) {
      const result = await send(new GetCommand({ TableName, Key: key }));
      return result.Item || null;
    },

    async query(params) {
      const result = await send(new QueryCommand({ TableName, ...params }));
      return result.Items || [];
    },

    async put(item) {
      const now = new Date().toISOString();
      const next = {
        createdAt: item.createdAt || now,
        updatedAt: now,
        ...item
      };
      await send(new PutCommand({ TableName, Item: next }));
      return next;
    },

    async delete(key) {
      await send(new DeleteCommand({ TableName, Key: key }));
      return true;
    }
  };
}

module.exports = { createRepository };
