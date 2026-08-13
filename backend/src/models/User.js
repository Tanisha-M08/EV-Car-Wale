module.exports = {
  entity: 'users',
  primaryKey: { pk: 'USER#<firebaseUid>', sk: 'PROFILE' },
  attributes: ['firebaseUid', 'name', 'email', 'phone', 'avatar', 'provider', 'role', 'lastLoginAt']
};
