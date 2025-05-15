const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Auth Routes
router.use('/auth', require('../routes/authRoutes'));

// Products Routes
router.use('/products', require('../routes/products'));

// Order Routes
router.use('/orders', require('../routes/orders'));

// Shipping Address Routes
router.use('/shipping-addresses', require('../routes/shippingAddresses'));

// Cart Routes
router.use('/cart', require('../routes/cart'));

// Payment Routes
router.use('/payments', require('../routes/payments'));

// Transaction Routes
router.use('/transactions', require('../routes/transactions'));

// Review Routes
router.use('/reviews', require('../routes/reviews'));

// Message Routes
router.use('/messages', require('../routes/messages'));

// Search Routes
router.use('/search', require('../routes/search'));

module.exports = router;
