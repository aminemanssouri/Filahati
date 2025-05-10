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


module.exports = router;
