const express = require('express');
const router = express.Router();
const { 
  createShippingAddress,
  getMyShippingAddresses
} = require('../controllers/orders');
const { verifyToken } = require('../middlewares/auth');

/**
 * @route   POST /api/shipping-addresses
 * @desc    Create a new shipping address
 * @access  Private (Buyers only)
 */
router.post('/', verifyToken, createShippingAddress);

/**
 * @route   GET /api/shipping-addresses/my
 * @desc    Get all shipping addresses for the authenticated buyer
 * @access  Private (Buyers only)
 */
router.get('/my', verifyToken, getMyShippingAddresses);

module.exports = router;
