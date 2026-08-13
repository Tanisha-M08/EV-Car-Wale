const crypto = require('crypto');
const { createRepository } = require('./dynamoRepository');

const repo = createRepository('reviews');

async function listReviews(filters = {}) {
  const reviews = await repo.scan();
  return reviews
    .filter(review => {
      if (review.status && review.status !== 'approved') return false;
      if (filters.carId && review.carId !== filters.carId) return false;
      if (filters.type && review.type !== filters.type) return false;
      return true;
    })
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
}

async function createReview(review) {
  const id = review.id || crypto.randomUUID();
  return repo.put({
    pk: `REVIEW#${id}`,
    sk: 'DETAILS',
    id,
    type: 'customer',
    status: 'approved',
    ...review
  });
}

module.exports = { listReviews, createReview };
