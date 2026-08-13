module.exports = {
  entity: 'newsletter',
  primaryKey: { pk: 'NEWSLETTER#<email>', sk: 'SUBSCRIPTION' },
  attributes: ['email', 'source', 'status']
};
