const { asyncHandler } = require('../utils/asyncHandler');
const reviewRepository = require('../repositories/reviewRepository');
const { isDataStoreConfigured, emptyListResponse, dataUnavailableResponse } = require('../utils/dataState');

const listReviews = asyncHandler(async (req, res) => {
  if (!isDataStoreConfigured()) return emptyListResponse(res);

  const reviews = await reviewRepository.listReviews({
    carId: req.query.carId,
    type: req.query.type
  });
  res.json({ success: true, count: reviews.length, data: reviews });
});

const createReview = asyncHandler(async (req, res) => {
  if (!isDataStoreConfigured()) return dataUnavailableResponse(res);

  const review = await reviewRepository.createReview({
    ...req.body,
    firebaseUid: req.firebaseUser ? req.firebaseUser.uid : undefined
  });
  res.status(201).json({ success: true, data: review });
});

module.exports = { listReviews, createReview };
