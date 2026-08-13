const { asyncHandler } = require('../utils/asyncHandler');
const carRepository = require('../repositories/carRepository');
const { isDataStoreConfigured, emptyListResponse } = require('../utils/dataState');

const listCars = asyncHandler(async (req, res) => {
  if (!isDataStoreConfigured()) return emptyListResponse(res);

  const cars = await carRepository.listCars({
    brand: req.query.brand,
    section: req.query.section,
    search: req.query.search
  });
  res.json({ success: true, count: cars.length, data: cars });
});

const getCar = asyncHandler(async (req, res) => {
  if (!isDataStoreConfigured()) return res.status(404).json({ success: false, error: 'Car not found' });

  const car = await carRepository.getCar(req.params.id);
  if (!car) return res.status(404).json({ success: false, error: 'Car not found' });
  res.json({ success: true, data: car });
});

const listBrands = asyncHandler(async (req, res) => {
  if (!isDataStoreConfigured()) return emptyListResponse(res);

  const brands = await carRepository.listBrands();
  res.json({ success: true, count: brands.length, data: brands });
});

module.exports = { listCars, getCar, listBrands };
