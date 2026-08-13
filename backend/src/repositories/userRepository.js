const { createRepository } = require('./dynamoRepository');
const { isDynamoConfigured } = require('../config/aws');

const repo = createRepository('users');

async function upsertUser(user) {
  const uid = user.firebaseUid || user.id || user.email;
  if (!isDynamoConfigured()) {
    return { ...user, pk: `USER#${uid}`, sk: 'PROFILE' };
  }
  return repo.put({
    pk: `USER#${uid}`,
    sk: 'PROFILE',
    ...user
  });
}

async function getUser(firebaseUid) {
  if (!firebaseUid) return null;
  if (!isDynamoConfigured()) {
    return null;
  }
  try {
    return await repo.get({ pk: `USER#${firebaseUid}`, sk: 'PROFILE' });
  } catch (error) {
    console.error(`Error fetching user ${firebaseUid}:`, error.message || error);
    return null;
  }
}

module.exports = {
  upsertUser,
  getUser
};

