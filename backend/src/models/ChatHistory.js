module.exports = {
  entity: 'chat_history',
  primaryKey: { pk: 'CHAT#<firebaseUid|anonymous>', sk: 'TURN#<createdAt>#<id>' },
  attributes: ['id', 'firebaseUid', 'messages', 'reply', 'provider']
};
