const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { listRecentlyViewed, addRecentlyViewed } = require('../controllers/recentlyViewedController');

const router = express.Router();

router.get('/', requireAuth, listRecentlyViewed);
router.post('/', requireAuth, addRecentlyViewed);

module.exports = router;
