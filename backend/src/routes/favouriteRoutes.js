const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { listFavourites, addFavourite, removeFavourite } = require('../controllers/favouriteController');

const router = express.Router();

router.get('/', requireAuth, listFavourites);
router.post('/', requireAuth, addFavourite);
router.delete('/:carId', requireAuth, removeFavourite);

module.exports = router;
