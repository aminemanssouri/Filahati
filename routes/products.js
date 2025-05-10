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
router.get('/:id', GetProductById);

/**
 * @route   GET /api/products/producer/:producerId
 * @desc    Get all products by a specific producer
 * @access  Public
 */
router.get('/producer/:producerId', GetProductsByProducerId);

/**
 * @route   GET /api/products/my/products
 * @desc    Get all products of the authenticated producer
 * @access  Private (Producers only)
 */
router.get('/my/products', verifyToken, GetMyProducts);

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
