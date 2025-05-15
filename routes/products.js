const express = require('express');
const router = express.Router();
const { 
  CreateProduct, 
  GetProductById, 
  GetProductsByProducerId, 
  GetMyProducts, 
  UpdateProduct, 
  DeleteProduct 
} = require('../controllers/products');
const { verifyToken } = require('../middlewares/auth');
const cacheMiddleware = require('../middlewares/cacheMiddleware');

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private (Producers only)
 */
router.post('/', verifyToken, CreateProduct);

/**
 * @route   GET /api/products/:id
 * @desc    Get a product by ID
 * @access  Public
 */
router.get('/:id', cacheMiddleware(3600), GetProductById); // Cache for 1 hour

/**
 * @route   GET /api/products/producer/:producerId
 * @desc    Get all products by a specific producer
 * @access  Public
 */
router.get('/producer/:producerId', cacheMiddleware(1800), GetProductsByProducerId); // Cache for 30 minutes

/**
 * @route   GET /api/products/my/products
 * @desc    Get all products of the authenticated producer
 * @access  Private (Producers only)
 */
router.get('/my/products', verifyToken, cacheMiddleware(900), GetMyProducts); // Cache for 15 minutes

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private (Producers only)
 */
router.put('/:id', verifyToken, UpdateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product
 * @access  Private (Producers only)
 */
router.delete('/:id', verifyToken, DeleteProduct);

module.exports = router;
