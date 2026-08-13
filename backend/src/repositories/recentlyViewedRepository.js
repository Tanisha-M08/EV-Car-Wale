const { createRepository } = require('./dynamoRepository');

const repo = createRepository('recently_viewed');

async function listRecentlyViewed(firebaseUid) {
  const items = await repo.scan();
  return items
    .filter(item => item.firebaseUid === firebaseUid)
    .sort((a, b) => String(b.viewedAt || '').localeCompare(String(a.viewedAt || '')))
    .slice(0, 12);
}

async function addRecentlyViewed(firebaseUid, carId) {
  return repo.put({
    pk: `USER#${firebaseUid}`,
    sk: `RECENT#${carId}`,
    firebaseUid,
    carId,
    viewedAt: new Date().toISOString()
  });
}

module.exports = { listRecentlyViewed, addRecentlyViewed };
