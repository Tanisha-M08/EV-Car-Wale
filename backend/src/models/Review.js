module.exports = {
  entity: 'reviews',
  primaryKey: { pk: 'REVIEW#<id>', sk: 'DETAILS' },
  attributes: ['id', 'carId', 'firebaseUid', 'type', 'author', 'rating', 'title', 'content', 'pros', 'cons', 'status']
};
