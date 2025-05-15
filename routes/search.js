const express = require('express');
const router = express.Router();
const { SearchProducts } = require('../controllers/search');
const cacheMiddleware = require('../middlewares/cacheMiddleware');

/**
 * @route   GET /api/search/products
 * @desc    Search for products using full-text search
 * @access  Public
 */
router.get('/products', cacheMiddleware(300), SearchProducts); // Cache results for 5 minutes

module.exports = router;
