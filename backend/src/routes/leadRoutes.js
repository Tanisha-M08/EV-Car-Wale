const express = require('express');
const { createTestDriveRequest, subscribeNewsletter } = require('../controllers/leadController');

const router = express.Router();

router.post('/test-drives', createTestDriveRequest);
router.post('/newsletter', subscribeNewsletter);

module.exports = router;
