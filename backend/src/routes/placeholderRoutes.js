const express = require('express');
const { notImplemented } = require('../controllers/placeholderController');

function placeholderRoutes(feature) {
  const router = express.Router();
  router.get('/', notImplemented(feature));
  router.post('/', notImplemented(feature));
  return router;
}

module.exports = placeholderRoutes;
