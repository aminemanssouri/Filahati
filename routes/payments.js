const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');
const {verifyToken} = require('../middlewares/auth');

// All payment routes require authentication

// Create a new payment
router.post('/',verifyToken, paymentController.createPayment);

// Get payment by ID
router.get('/:paymentId', verifyToken, paymentController.getPaymentById);

// Get payments by order ID
router.get('/order/:orderId', verifyToken, paymentController.getPaymentsByOrderId);

// Get transactions by order ID
router.get('/transactions/order/:orderId', verifyToken, paymentController.getTransactionsByOrderId);

// Update payment status (for webhook callbacks from payment gateways)
// Note: In a production environment, this endpoint should be secured with API keys or signatures
router.patch('/:paymentId/status', verifyToken,  paymentController.updatePaymentStatus);

module.exports = router;
