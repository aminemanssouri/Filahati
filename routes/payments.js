const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');
const {verifyToken} = require('../middlewares/auth');

// All payment routes require authentication
router.use(verifyToken);

// Create a new payment
router.post('/', paymentController.createPayment);

// Get payment by ID
router.get('/:paymentId', paymentController.getPaymentById);

// Get payments by order ID
router.get('/order/:orderId', paymentController.getPaymentsByOrderId);

// Get transactions by order ID
router.get('/transactions/order/:orderId', paymentController.getTransactionsByOrderId);

// Update payment status (for webhook callbacks from payment gateways)
// Note: In a production environment, this endpoint should be secured with API keys or signatures
router.patch('/:paymentId/status', paymentController.updatePaymentStatus);

module.exports = router;
