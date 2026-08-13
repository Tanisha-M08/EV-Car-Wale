const express = require('express');

const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const carRoutes = require('./carRoutes');
const blogRoutes = require('./blogRoutes');
const reviewRoutes = require('./reviewRoutes');
const favouriteRoutes = require('./favouriteRoutes');
const recentlyViewedRoutes = require('./recentlyViewedRoutes');
const leadRoutes = require('./leadRoutes');
const placeholderRoutes = require('./placeholderRoutes');
const chargerRoutes = require('./chargerRoutes');
const newsRoutes = require('./newsRoutes');
const videoRoutes = require('./videoRoutes');
const carImageRoutes = require('./carImageRoutes');
const translateRoutes = require('./translateRoutes');
const routeRoutes = require('./routeRoutes');
const { createChatController } = require('../controllers/chatController');

function apiRoutes(options = {}) {
  const router = express.Router();

  router.use('/health', healthRoutes);
  router.use('/auth', authRoutes);
  router.use('/cars', carRoutes);
  router.use('/brands', carRoutes);
  router.use('/blogs', blogRoutes);
  router.use('/reviews', reviewRoutes);
  router.use('/favourites', favouriteRoutes);
  router.use('/recently-viewed', recentlyViewedRoutes);
  router.use('/news', newsRoutes);
  router.use('/videos', videoRoutes);
  router.use('/car-images', carImageRoutes);
  router.use('/translate', translateRoutes);
  router.use('/route', routeRoutes);
  router.use('/', leadRoutes);
  router.use('/chargers', chargerRoutes);
  router.use('/payments', placeholderRoutes('Payments'));
  router.use('/notifications', placeholderRoutes('Notifications'));
  router.use('/admin', placeholderRoutes('Admin Dashboard'));
  router.post('/chat', (req, res, next) => {
    console.log('[STAGE 2: Route entered] /api/chat route entered in backend/src/routes/index.js');
    next();
  }, createChatController(options.aiServicePath));

  return router;
}

module.exports = apiRoutes;
