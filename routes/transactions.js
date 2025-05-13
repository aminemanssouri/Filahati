const express = require('express');
const router = express.Router();
const { 
  createTransaction,
  getTransactionById,
  getTransactionsByOrderId,
  updateTransactionStatus,
  generateTransactionId
} = require('../controllers/transaction');
const { verifyToken } = require('../middlewares/auth');

/**
 * @route   POST /api/transactions
 * @desc    Create a new transaction
 * @access  Private (Buyers or Admins only)
 */
router.post('/', verifyToken, createTransaction);

/**
 * @route   GET /api/transactions/:id
 * @desc    Get a transaction by ID
 * @access  Private (Transaction's buyer or Admin)
 */
router.get('/:id', verifyToken, getTransactionById);

/**
 * @route   GET /api/transactions/order/:orderId
 * @desc    Get all transactions for an order
 * @access  Private (Order's buyer or Admin)
 */
router.get('/order/:orderId', verifyToken, getTransactionsByOrderId);

/**
 * @route   PUT /api/transactions/:id/status
 * @desc    Update transaction status
 * @access  Private (Admins only)
 */
router.put('/:id/status', verifyToken, updateTransactionStatus);

/**
 * @route   GET /api/transactions/generate/id
 * @desc    Generate a new transaction ID (UUID)
 * @access  Private (Buyers or Admins only)
 */
router.get('/generate/id', verifyToken, generateTransactionId);

module.exports = router;
