const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');
const authMiddleware = require('../middleware/authMiddleware');

// All payment routes require authentication
router.use(authMiddleware.authenticateToken);

// Create a new payment
router.post('/', authMiddleware.isBuyer, paymentController.createPayment);

// Get payment by ID
router.get('/:paymentId', authMiddleware.isBuyer, paymentController.getPaymentById);

// Get payments by order ID
router.get('/order/:orderId', authMiddleware.isBuyer, paymentController.getPaymentsByOrderId);

// Get transactions by order ID
router.get('/transactions/order/:orderId', authMiddleware.isBuyer, paymentController.getTransactionsByOrderId);

// Update payment status (for webhook callbacks from payment gateways)
// Note: In a production environment, this endpoint should be secured with API keys or signatures
router.patch('/:paymentId/status', paymentController.updatePaymentStatus);

module.exports = router;
