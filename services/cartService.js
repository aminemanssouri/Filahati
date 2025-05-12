const db = require('../models');
const { Cart, CartItem, Product, Image, Category, City, Producer } = db;

/**
 * Get or create a cart for a buyer
 * @param {number} buyerId - Buyer ID
 * @returns {Promise<Object>} - Cart object
 */
const getOrCreateCart = async (buyerId) => {
  try {
    // Find existing cart
    let cart = await Cart.findOne({
      where: { buyerId }
    });
    
    // If no cart exists, create one
    if (!cart) {
      cart = await Cart.create({ buyerId });
    }
    
    return { success: true, cart };
  } catch (error) {
    return { success: false, message: "Error getting or creating cart: " + error.message };
  }
};

/**
 * Get cart with items for a buyer
 * @param {number} buyerId - Buyer ID
 * @returns {Promise<Object>} - Cart with items
 */
const getCart = async (buyerId) => {
  try {
    // Get or create cart
    const cartResult = await getOrCreateCart(buyerId);
    if (!cartResult.success) {
      return cartResult;
    }
    
    // Get cart with items
    const cart = await Cart.findByPk(cartResult.cart.id, {
      include: [
        {
          model: CartItem,
          include: [
            {
              model: Product,
              include: [
                { model: Image, limit: 1 },
                { model: Category, attributes: ['id', 'name'] },
                { model: City, attributes: ['id', 'name'] },
                { model: Producer, attributes: ['id', 'businessName'] }
              ]
            }
          ]
        }
      ]
    });
    
    if (!cart) {
      return { success: false, message: "Cart not found" };
    }
    
    // Calculate cart totals
    const cartItems = cart.CartItems || [];
    const itemCount = cartItems.length;
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    
    return {
      success: true,
      cart: {
        id: cart.id,
        buyerId: cart.buyerId,
        items: cartItems,
        itemCount,
        totalQuantity,
        subtotal
      }
    };
  } catch (error) {
    return { success: false, message: "Error retrieving cart: " + error.message };
  }
};

/**
 * Add a product to cart
 * @param {number} buyerId - Buyer ID
 * @param {number} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @returns {Promise<Object>} - Updated cart
 */
const addToCart = async (buyerId, productId, quantity = 1) => {
  try {
    // Validate quantity
    quantity = parseInt(quantity);
    if (isNaN(quantity) || quantity < 1) {
      return { success: false, message: "Quantity must be a positive number" };
    }
    
    // Get product
    const product = await Product.findByPk(productId);
    if (!product) {
      return { success: false, message: "Product not found" };
    }
    
    // Check if product is available
    if (product.status === 'Out of Stock' || product.Availablequantity < quantity) {
      return { success: false, message: "Product is out of stock or has insufficient quantity" };
    }
    
    // Get or create cart
    const cartResult = await getOrCreateCart(buyerId);
    if (!cartResult.success) {
      return cartResult;
    }
    
    const cart = cartResult.cart;
    
    // Check if product already exists in cart
    let cartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId
      }
    });
    
    // Calculate price and subtotal
    const price = parseFloat(product.price);
    
    if (cartItem) {
      // Update existing cart item
      const newQuantity = cartItem.quantity + quantity;
      const subtotal = price * newQuantity;
      
      await cartItem.update({
        quantity: newQuantity,
        subtotal
      });
    } else {
      // Create new cart item
      const subtotal = price * quantity;
      
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
        price,
        subtotal
      });
    }
    
    // Return updated cart
    return getCart(buyerId);
  } catch (error) {
    return { success: false, message: "Error adding product to cart: " + error.message };
  }
};

/**
 * Update cart item quantity
 * @param {number} buyerId - Buyer ID
 * @param {number} cartItemId - Cart item ID
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} - Updated cart
 */
const updateCartItem = async (buyerId, cartItemId, quantity) => {
  try {
    // Validate quantity
    quantity = parseInt(quantity);
    if (isNaN(quantity) || quantity < 1) {
      return { success: false, message: "Quantity must be a positive number" };
    }
    
    // Get cart
    const cartResult = await getOrCreateCart(buyerId);
    if (!cartResult.success) {
      return cartResult;
    }
    
    // Find cart item and verify it belongs to the buyer's cart
    const cartItem = await CartItem.findOne({
      where: {
        id: cartItemId,
        cartId: cartResult.cart.id
      },
      include: [{ model: Product }]
    });
    
    if (!cartItem) {
      return { success: false, message: "Cart item not found or does not belong to your cart" };
    }
    
    // Check product availability
    if (cartItem.Product.status === 'Out of Stock' || cartItem.Product.Availablequantity < quantity) {
      return { success: false, message: "Product is out of stock or has insufficient quantity" };
    }
    
    // Update cart item
    const subtotal = parseFloat(cartItem.price) * quantity;
    
    await cartItem.update({
      quantity,
      subtotal
    });
    
    // Return updated cart
    return getCart(buyerId);
  } catch (error) {
    return { success: false, message: "Error updating cart item: " + error.message };
  }
};

/**
 * Remove item from cart
 * @param {number} buyerId - Buyer ID
 * @param {number} cartItemId - Cart item ID
 * @returns {Promise<Object>} - Updated cart
 */
const removeFromCart = async (buyerId, cartItemId) => {
  try {
    // Get cart
    const cartResult = await getOrCreateCart(buyerId);
    if (!cartResult.success) {
      return cartResult;
    }
    
    // Find cart item and verify it belongs to the buyer's cart
    const cartItem = await CartItem.findOne({
      where: {
        id: cartItemId,
        cartId: cartResult.cart.id
      }
    });
    
    if (!cartItem) {
      return { success: false, message: "Cart item not found or does not belong to your cart" };
    }
    
    // Delete cart item
    await cartItem.destroy();
    
    // Return updated cart
    return getCart(buyerId);
  } catch (error) {
    return { success: false, message: "Error removing item from cart: " + error.message };
  }
};

/**
 * Clear cart (remove all items)
 * @param {number} buyerId - Buyer ID
 * @returns {Promise<Object>} - Empty cart
 */
const clearCart = async (buyerId) => {
  try {
    // Get cart
    const cartResult = await getOrCreateCart(buyerId);
    if (!cartResult.success) {
      return cartResult;
    }
    
    // Delete all cart items
    await CartItem.destroy({
      where: { cartId: cartResult.cart.id }
    });
    
    // Return empty cart
    return getCart(buyerId);
  } catch (error) {
    return { success: false, message: "Error clearing cart: " + error.message };
  }
};

/**
 * Sync local cart with database cart
 * @param {number} buyerId - Buyer ID
 * @param {Array} items - Array of items from local cart (productId and quantity)
 * @returns {Promise<Object>} - Updated cart
 */
const syncCart = async (buyerId, items) => {
  try {
    if (!Array.isArray(items) || items.length === 0) {
      return getCart(buyerId);
    }
    
    // Clear existing cart first
    await clearCart(buyerId);
    
    // Add each item to cart
    for (const item of items) {
      if (item.productId && item.quantity) {
        await addToCart(buyerId, item.productId, item.quantity);
      }
    }
    
    // Return updated cart
    return getCart(buyerId);
  } catch (error) {
    return { success: false, message: "Error syncing cart: " + error.message };
  }
};

/**
 * Convert cart to order data
 * @param {number} buyerId - Buyer ID
 * @param {Object} orderData - Additional order data
 * @returns {Promise<Object>} - Order data ready for order creation
 */
const cartToOrder = async (buyerId, orderData) => {
  try {
    // Get cart with items
    const cartResult = await getCart(buyerId);
    if (!cartResult.success) {
      return cartResult;
    }
    
    const cart = cartResult.cart;
    
    // Check if cart is empty
    if (cart.items.length === 0) {
      return { success: false, message: "Cart is empty" };
    }
    
    // Prepare order items
    const orderItems = cart.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.price,
      subtotal: item.subtotal,
      buyerNotes: orderData.notes || null
    }));
    
    // Prepare order data
    const preparedOrderData = {
      ...orderData,
      orderItems,
      totalAmount: cart.subtotal + (orderData.shippingCost || 0)
    };
    
    return { success: true, orderData: preparedOrderData };
  } catch (error) {
    return { success: false, message: "Error converting cart to order: " + error.message };
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
  cartToOrder
};
