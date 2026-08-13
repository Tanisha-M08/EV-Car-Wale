const { isDynamoConfigured, isS3Configured } = require('../config/aws');

function health(req, res) {
  res.json({
    success: true,
    service: 'EV CAR WALE API',
    status: 'ok',
    database: 'dynamodb',
    dynamodb: isDynamoConfigured() ? 'configured' : 'not-configured',
    s3: isS3Configured() ? 'configured' : 'not-configured',
    timestamp: new Date().toISOString()
  });
}

module.exports = { health };
