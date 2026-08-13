module.exports = {
  entity: 'recently_viewed',
  primaryKey: { pk: 'USER#<firebaseUid>', sk: 'RECENT#<carId>' },
  attributes: ['firebaseUid', 'carId', 'viewedAt']
};
