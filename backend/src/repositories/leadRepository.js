const crypto = require('crypto');
const { createRepository } = require('./dynamoRepository');

const testDriveRepo = createRepository('test_drives');
const newsletterRepo = createRepository('newsletter');

async function createTestDriveRequest(payload) {
  const id = crypto.randomUUID();
  return testDriveRepo.put({
    pk: `TEST_DRIVE#${id}`,
    sk: 'BOOKING',
    id,
    status: 'new',
    ...payload
  });
}

async function subscribeNewsletter(email, source = 'footer') {
  return newsletterRepo.put({
    pk: `NEWSLETTER#${email}`,
    sk: 'SUBSCRIPTION',
    email,
    source,
    status: 'subscribed'
  });
}

module.exports = { createTestDriveRequest, subscribeNewsletter };
