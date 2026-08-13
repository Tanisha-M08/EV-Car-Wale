module.exports = {
  entity: 'favourites',
  primaryKey: { pk: 'USER#<firebaseUid>', sk: 'FAVOURITE#<carId>' },
  attributes: ['firebaseUid', 'carId']
};
