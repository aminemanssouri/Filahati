const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Auth Routes
router.use('/auth', require('../routes/authRoutes'));

module.exports = router;
