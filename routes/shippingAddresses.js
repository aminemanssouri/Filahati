const express = require('express');
const router = express.Router();
const shippingAddressController = require('../controllers/shippingAddress');
const { verifyToken } = require('../middlewares/auth');

/**
 * @route   POST /api/shipping-addresses
 * @desc    Create a new shipping address
 * @access  Private (Buyers only)
 */
router.post('/', verifyToken, shippingAddressController.createShippingAddress);

/**
 * @route   GET /api/shipping-addresses/my
 * @desc    Get all shipping addresses for the authenticated buyer
 * @access  Private (Buyers only)
 */
router.get('/my', verifyToken, shippingAddressController.getMyShippingAddresses);

/**
 * @route   GET /api/shipping-addresses/:id
 * @desc    Get a shipping address by ID
 * @access  Private (Buyers only)
 */
router.get('/:id', verifyToken, shippingAddressController.getShippingAddressById);

/**
 * @route   PUT /api/shipping-addresses/:id
 * @desc    Update a shipping address
 * @access  Private (Buyers only)
 */
router.put('/:id', verifyToken, shippingAddressController.updateShippingAddress);

/**
 * @route   DELETE /api/shipping-addresses/:id
 * @desc    Delete a shipping address
 * @access  Private (Buyers only)
 */
router.delete('/:id', verifyToken, shippingAddressController.deleteShippingAddress);

/**
 * @route   PUT /api/shipping-addresses/:id/default
 * @desc    Set a shipping address as default
 * @access  Private (Buyers only)
 */
router.put('/:id/default', verifyToken, shippingAddressController.setDefaultShippingAddress);

module.exports = router;
