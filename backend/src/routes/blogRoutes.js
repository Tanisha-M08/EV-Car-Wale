const express = require('express');
const { listBlogs, getBlogBySlug } = require('../controllers/blogController');

const router = express.Router();

router.get('/', listBlogs);
router.get('/:category/:slug', getBlogBySlug);

module.exports = router;
