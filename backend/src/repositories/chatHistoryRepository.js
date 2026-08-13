const crypto = require('crypto');
const { createRepository } = require('./dynamoRepository');

const repo = createRepository('chat_history');

async function saveChatTurn(payload) {
  const id = crypto.randomUUID();
  return repo.put({
    pk: `CHAT#${payload.firebaseUid || 'anonymous'}`,
    sk: `TURN#${new Date().toISOString()}#${id}`,
    id,
    ...payload
  });
}

module.exports = { saveChatTurn };
