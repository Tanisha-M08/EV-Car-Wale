const { asyncHandler } = require('../utils/asyncHandler');
const recentlyViewedRepository = require('../repositories/recentlyViewedRepository');
const { isDataStoreConfigured, emptyListResponse, dataUnavailableResponse } = require('../utils/dataState');

const listRecentlyViewed = asyncHandler(async (req, res) => {
  if (!isDataStoreConfigured()) return emptyListResponse(res);

  const items = await recentlyViewedRepository.listRecentlyViewed(req.firebaseUser.uid);
  res.json({ success: true, count: items.length, data: items.map(item => item.carId) });
});

const addRecentlyViewed = asyncHandler(async (req, res) => {
  if (!isDataStoreConfigured()) return dataUnavailableResponse(res);

  const carId = req.body.carId;
  if (!carId) return res.status(400).json({ success: false, error: 'carId is required' });

  await recentlyViewedRepository.addRecentlyViewed(req.firebaseUser.uid, carId);

  res.status(201).json({ success: true, data: { carId } });
});

module.exports = { listRecentlyViewed, addRecentlyViewed };
