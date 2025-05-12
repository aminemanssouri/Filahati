const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getOrderById, 
  getMyOrders, 
  getProducerOrders,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orders');
const { verifyToken } = require('../middlewares/auth');

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private (Buyers only)
 */
router.post('/', verifyToken, createOrder);

/**
 * @route   GET /api/orders/:id
 * @desc    Get an order by ID
 * @access  Private (Order's buyer or producer of products in the order)
 */
router.get('/:id', verifyToken, getOrderById);

/**
 * @route   GET /api/orders/my
 * @desc    Get all orders for the authenticated buyer
 * @access  Private (Buyers only)
 */
router.get('/myOrders', verifyToken, getMyOrders);

/**
 * @route   GET /api/orders/producer
 * @desc    Get all orders containing the authenticated producer's products
 * @access  Private (Producers only)
 */
router.get('/producerOrders', verifyToken, getProducerOrders);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (Admin or producer of products in the order)
 */
router.put('/:id/status', verifyToken, updateOrderStatus);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel an order
 * @access  Private (Order's buyer only)
 */
router.put('/:id/cancel', verifyToken, cancelOrder);

module.exports = router;
