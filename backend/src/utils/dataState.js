const { isDynamoConfigured } = require('../config/aws');

function isDataStoreConfigured() {
  return isDynamoConfigured();
}

function emptyListResponse(res) {
  return res.json({
    success: true,
    count: 0,
    data: [],
    source: 'dynamodb-not-configured'
  });
}

function dataUnavailableResponse(res) {
  return res.status(503).json({
    success: false,
    error: 'DynamoDB is not configured. Set AWS_REGION and AWS credentials/IAM role to enable persistence.'
  });
}

module.exports = { isDataStoreConfigured, emptyListResponse, dataUnavailableResponse };
