module.exports = {
  entity: 'notifications',
  primaryKey: { pk: 'USER#<firebaseUid>', sk: 'NOTIFICATION#<createdAt>#<id>' },
  attributes: ['id', 'firebaseUid', 'channel', 'title', 'message', 'status', 'metadata']
};
