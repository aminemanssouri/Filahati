const express = require('express');
const router = express.Router();

// Sample route
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// API Routes
router.use('/samples', require('./sampleRoutes'));

// TODO: Add your other API routes here
// Example:
// router.use('/users', require('./users'));
// router.use('/products', require('./products'));

module.exports = router;
