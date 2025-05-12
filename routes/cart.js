const express = require('express');
const router = express.Router();
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart, 
  syncCart,
  checkout
} = require('../controllers/cart');
const { verifyToken } = require('../middlewares/auth');

/**
 * @route   GET /api/cart
 * @desc    Get cart with items for the authenticated buyer
 * @access  Private (Buyers only)
 */
router.get('/', verifyToken, getCart);

/**
 * @route   POST /api/cart
 * @desc    Add product to cart
 * @access  Private (Buyers only)
 */
router.post('/', verifyToken, addToCart);

/**
 * @route   PUT /api/cart/items/:cartItemId
 * @desc    Update cart item quantity
 * @access  Private (Buyers only)
 */
router.put('/items/:cartItemId', verifyToken, updateCartItem);

/**
 * @route   DELETE /api/cart/items/:cartItemId
 * @desc    Remove item from cart
 * @access  Private (Buyers only)
 */
router.delete('/items/:cartItemId', verifyToken, removeFromCart);

/**
 * @route   DELETE /api/cart
 * @desc    Clear cart (remove all items)
 * @access  Private (Buyers only)
 */
router.delete('/', verifyToken, clearCart);

/**
 * @route   POST /api/cart/sync
 * @desc    Sync local cart with database
 * @access  Private (Buyers only)
 */
router.post('/sync', verifyToken, syncCart);

/**
 * @route   POST /api/cart/checkout
 * @desc    Checkout cart (convert to order)
 * @access  Private (Buyers only)
 */
router.post('/checkout', verifyToken, checkout);

module.exports = router;
