const cartService = require('../services/cartService');
const { getBuyerByUserId } = require('../services/orderService');

/**
 * Get cart with items for the authenticated buyer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCart = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Verify user is a buyer
    if (userRole !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can access cart'
      });
    }
    
    // Get buyer ID
    const buyerResult = await getBuyerByUserId(userId);
    if (!buyerResult.success) {
      return res.status(400).json({
        success: false,
        message: buyerResult.message
      });
    }
    
    // Get cart
    const result = await cartService.getCart(buyerResult.buyerId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      success: true,
      cart: result.cart
    });
  } catch (error) {
    console.error('Error retrieving cart:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the cart'
    });
  }
};

/**
 * Add product to cart
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { productId, quantity } = req.body;
    
    // Validate request
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Verify user is a buyer
    if (userRole !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can add items to cart'
      });
    }
    
    // Get buyer ID
    const buyerResult = await getBuyerByUserId(userId);
    if (!buyerResult.success) {
      return res.status(400).json({
        success: false,
        message: buyerResult.message
      });
    }
    
    // Add to cart
    const result = await cartService.addToCart(buyerResult.buyerId, productId, quantity);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Product added to cart',
      cart: result.cart
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while adding to cart'
    });
  }
};

/**
 * Update cart item quantity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCartItem = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    
    // Validate request
    if (!quantity) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required'
      });
    }
    
    // Verify user is a buyer
    if (userRole !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can update cart items'
      });
    }
    
    // Get buyer ID
    const buyerResult = await getBuyerByUserId(userId);
    if (!buyerResult.success) {
      return res.status(400).json({
        success: false,
        message: buyerResult.message
      });
    }
    
    // Update cart item
    const result = await cartService.updateCartItem(buyerResult.buyerId, cartItemId, quantity);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Cart item updated',
      cart: result.cart
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating cart item'
    });
  }
};

/**
 * Remove item from cart
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { cartItemId } = req.params;
    
    // Verify user is a buyer
    if (userRole !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can remove items from cart'
      });
    }
    
    // Get buyer ID
    const buyerResult = await getBuyerByUserId(userId);
    if (!buyerResult.success) {
      return res.status(400).json({
        success: false,
        message: buyerResult.message
      });
    }
    
    // Remove from cart
    const result = await cartService.removeFromCart(buyerResult.buyerId, cartItemId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: result.cart
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while removing item from cart'
    });
  }
};

/**
 * Clear cart (remove all items)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const clearCart = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Verify user is a buyer
    if (userRole !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can clear cart'
      });
    }
    
    // Get buyer ID
    const buyerResult = await getBuyerByUserId(userId);
    if (!buyerResult.success) {
      return res.status(400).json({
        success: false,
        message: buyerResult.message
      });
    }
    
    // Clear cart
    const result = await cartService.clearCart(buyerResult.buyerId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart: result.cart
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while clearing cart'
    });
  }
};

/**
 * Sync local cart with database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const syncCart = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { items } = req.body;
    
    // Validate request
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array'
      });
    }
    
    // Verify user is a buyer
    if (userRole !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can sync cart'
      });
    }
    
    // Get buyer ID
    const buyerResult = await getBuyerByUserId(userId);
    if (!buyerResult.success) {
      return res.status(400).json({
        success: false,
        message: buyerResult.message
      });
    }
    
    // Sync cart
    const result = await cartService.syncCart(buyerResult.buyerId, items);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Cart synced',
      cart: result.cart
    });
  } catch (error) {
    console.error('Error syncing cart:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while syncing cart'
    });
  }
};

/**
 * Checkout cart (convert to order)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkout = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const orderData = req.body;
    
    // Validate request
    if (!orderData.shippingAddressId || !orderData.paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address and payment method are required'
      });
    }
    
    // Verify user is a buyer
    if (userRole !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can checkout'
      });
    }
    
    // Get buyer ID
    const buyerResult = await getBuyerByUserId(userId);
    if (!buyerResult.success) {
      return res.status(400).json({
        success: false,
        message: buyerResult.message
      });
    }
    
    // Convert cart to order
    const cartToOrderResult = await cartService.cartToOrder(buyerResult.buyerId, orderData);
    
    if (!cartToOrderResult.success) {
      return res.status(400).json({
        success: false,
        message: cartToOrderResult.message
      });
    }
    
    // Create order using order service
    const orderService = require('../services/orderService');
    const createOrderResult = await orderService.createOrder(cartToOrderResult.orderData, buyerResult.buyerId);
    
    if (!createOrderResult.success) {
      return res.status(400).json({
        success: false,
        message: createOrderResult.message
      });
    }
    
    // Clear cart after successful order creation
    await cartService.clearCart(buyerResult.buyerId);
    
    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: createOrderResult.order
    });
  } catch (error) {
    console.error('Error during checkout:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during checkout'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
  checkout
};
