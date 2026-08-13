const { asyncHandler } = require('../utils/asyncHandler');
const leadRepository = require('../repositories/leadRepository');
const { isDataStoreConfigured, dataUnavailableResponse } = require('../utils/dataState');

const createTestDriveRequest = asyncHandler(async (req, res) => {
  if (!isDataStoreConfigured()) return dataUnavailableResponse(res);

  const payload = {
    carId: req.body.carId || req.body.car,
    carName: req.body.carName,
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    preferredDate: req.body.preferredDate || req.body.date,
    city: req.body.city
  };

  if (!payload.name || !payload.phone) {
    return res.status(400).json({ success: false, error: 'name and phone are required' });
  }

  const request = await leadRepository.createTestDriveRequest(payload);
  res.status(201).json({ success: true, data: request });
});

const subscribeNewsletter = asyncHandler(async (req, res) => {
  if (!isDataStoreConfigured()) return dataUnavailableResponse(res);

  const email = String(req.body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'A valid email is required' });
  }

  const subscription = await leadRepository.subscribeNewsletter(email, req.body.source || 'footer');

  res.status(201).json({ success: true, data: subscription });
});

module.exports = { createTestDriveRequest, subscribeNewsletter };
