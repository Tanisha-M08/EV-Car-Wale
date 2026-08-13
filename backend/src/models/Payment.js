module.exports = {
  entity: 'payments',
  primaryKey: { pk: 'USER#<firebaseUid>', sk: 'PAYMENT#<id>' },
  attributes: ['id', 'firebaseUid', 'provider', 'amount', 'currency', 'purpose', 'externalPaymentId', 'status', 'metadata']
};
