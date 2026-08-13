const { asyncHandler } = require('../utils/asyncHandler');
const favouriteRepository = require('../repositories/favouriteRepository');
const { isDataStoreConfigured, emptyListResponse, dataUnavailableResponse } = require('../utils/dataState');

const listFavourites = asyncHandler(async (req, res) => {
  if (!isDataStoreConfigured()) return emptyListResponse(res);

  const favourites = await favouriteRepository.listFavourites(req.firebaseUser.uid);
  res.json({ success: true, count: favourites.length, data: favourites.map(item => item.carId) });
});

const addFavourite = asyncHandler(async (req, res) => {
  if (!isDataStoreConfigured()) return dataUnavailableResponse(res);

  const carId = req.body.carId;
  if (!carId) return res.status(400).json({ success: false, error: 'carId is required' });

  await favouriteRepository.addFavourite(req.firebaseUser.uid, carId);

  res.status(201).json({ success: true, data: { carId } });
});

const removeFavourite = asyncHandler(async (req, res) => {
  if (!isDataStoreConfigured()) return dataUnavailableResponse(res);

  await favouriteRepository.removeFavourite(req.firebaseUser.uid, req.params.carId);
  res.json({ success: true });
});

module.exports = { listFavourites, addFavourite, removeFavourite };
