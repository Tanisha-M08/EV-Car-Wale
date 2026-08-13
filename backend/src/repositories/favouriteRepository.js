const { createRepository } = require('./dynamoRepository');

const repo = createRepository('favourites');

async function listFavourites(firebaseUid) {
  const items = await repo.scan();
  return items
    .filter(item => item.firebaseUid === firebaseUid)
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
}

async function addFavourite(firebaseUid, carId) {
  return repo.put({
    pk: `USER#${firebaseUid}`,
    sk: `FAVOURITE#${carId}`,
    firebaseUid,
    carId
  });
}

async function removeFavourite(firebaseUid, carId) {
  return repo.delete({
    pk: `USER#${firebaseUid}`,
    sk: `FAVOURITE#${carId}`
  });
}

module.exports = { listFavourites, addFavourite, removeFavourite };
