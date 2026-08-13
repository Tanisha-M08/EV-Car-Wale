module.exports = {
  entity: 'user_preferences',
  primaryKey: { pk: 'USER#<firebaseUid>', sk: 'PREFERENCES' },
  attributes: ['firebaseUid', 'language', 'notificationSettings', 'savedFilters', 'metadata']
};
