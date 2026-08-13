const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const { listReviews, createReview } = require('../controllers/reviewController');

const router = express.Router();

router.get('/', listReviews);
router.post('/', optionalAuth, createReview);

module.exports = router;
