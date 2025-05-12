const orderService = require('../services/orderService');
const shippingAddressService = require('../services/shippingAddressService');

/**
 * Create a new order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createOrder = async (req, res) => {
  try {
    // Get buyer ID from authenticated user (extracted from token in auth middleware)
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Verify user is a buyer
    if (userRole !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can create orders'
      });
    }
    
    const buyerResult = await orderService.getBuyerByUserId(userId);
    
    if (!buyerResult.success) {
      return res.status(400).json({
        success: false,
        message: buyerResult.message
      });
    }
    
    // Create order using service
    const orderData = req.body;
    const result = await orderService.createOrder(orderData, buyerResult.buyerId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: result.order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating the order'
    });
  }
};

/**
 * Get order by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getOrderById = async (req, res) => {
  try {
    // Validate and parse the order ID
    const orderId = req.params.id && !isNaN(parseInt(req.params.id)) ? parseInt(req.params.id) : null;
    
    // Check if orderId is valid
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }
    
    const userId = req.userId;
    
    
    // Check if user is a buyer
    const buyerResult = await orderService.getBuyerByUserId(userId);
    let buyerId = null;
    
    if (buyerResult.success) {
      buyerId = buyerResult.buyerId;
    }
    
    // Get order (if buyerId is provided, it will check authorization)
    const result = await orderService.getOrderById(orderId, buyerId);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      success: true,
      order: result.order
    });
  } catch (error) {
    console.error('Error retrieving order:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the order'
    });
  }
};

/**
 * Get all orders for the authenticated buyer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMyOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Verify user is a buyer
    if (userRole !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can view their orders'
      });
    }
    
    // Get buyer ID
    const buyerResult = await orderService.getBuyerByUserId(userId);
    
    if (!buyerResult.success) {
      return res.status(400).json({
        success: false,
        message: buyerResult.message
      });
    }
    
    // Get query parameters for pagination and filtering
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status
    };
    
    // Get orders for buyer
    const result = await orderService.getBuyerOrders(buyerResult.buyerId, options);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      success: true,
      orders: result.orders,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error retrieving orders:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving orders'
    });
  }
};

/**
 * Get all orders for producer's products
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProducerOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Verify user is a producer
    if (userRole !== 'producer') {
      return res.status(403).json({
        success: false,
        message: 'Only producers can access this resource'
      });
    }
    
    // Get producer ID
    const Producer = require('../models').Producer;
    const producer = await Producer.findOne({ where: { userId } });
    
    if (!producer) {
      return res.status(404).json({
        success: false,
        message: 'Producer profile not found'
      });
    }
    
    // Get query parameters for pagination and filtering
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status
    };
    
    // Get orders containing producer's products
    const result = await orderService.getProducerOrders(producer.id, options);
    
    return res.status(200).json({
      success: true,
      orders: result.orders,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error retrieving producer orders:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving orders'
    });
  }
};

/**
 * Update order status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Update order status
    const result = await orderService.updateOrderStatus(orderId, status);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: result.order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating order status'
    });
  }
};

/**
 * Cancel an order (buyer only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const cancelOrder = async (req, res) => {
  try {
    // Validate and parse the order ID
    const orderId = req.params.id && !isNaN(parseInt(req.params.id)) ? parseInt(req.params.id) : null;
    
    // Check if orderId is valid
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }
    
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Verify user is a buyer
    if (userRole !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can cancel orders'
      });
    }
    
    // Get buyer ID
    const buyerResult = await orderService.getBuyerByUserId(userId);
    
    if (!buyerResult.success) {
      return res.status(400).json({
        success: false,
        message: buyerResult.message
      });
    }
    
    // Cancel order
    const result = await orderService.cancelOrder(orderId, buyerResult.buyerId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: result.order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while cancelling the order'
    });
  }
};

/**
 * Create a shipping address for the authenticated buyer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createShippingAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Verify user is a buyer
    if (userRole !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can create shipping addresses'
      });
    }
    
    // Get buyer ID
    const buyerResult = await orderService.getBuyerByUserId(userId);
    
    if (!buyerResult.success) {
      return res.status(400).json({
        success: false,
        message: buyerResult.message
      });
    }
    
    // Create shipping address
    const addressData = req.body;
    const address = await shippingAddressService.createShippingAddress(addressData, buyerResult.buyerId);
    
    return res.status(201).json({
      success: true,
      message: 'Shipping address created successfully',
      address
    });
  } catch (error) {
    console.error('Error creating shipping address:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating shipping address'
    });
  }
};

/**
 * Get all shipping addresses for the authenticated buyer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMyShippingAddresses = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Verify user is a buyer
    if (userRole !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can access shipping addresses'
      });
    }
    
    // Get buyer ID
    const buyerResult = await orderService.getBuyerByUserId(userId);
    
    if (!buyerResult.success) {
      return res.status(400).json({
        success: false,
        message: buyerResult.message
      });
    }
    
    // Get shipping addresses
    const addresses = await shippingAddressService.getBuyerShippingAddresses(buyerResult.buyerId);
    
    return res.status(200).json({
      success: true,
      addresses
    });
  } catch (error) {
    console.error('Error retrieving shipping addresses:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving shipping addresses'
    });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getProducerOrders,
  updateOrderStatus,
  cancelOrder,
  createShippingAddress,
  getMyShippingAddresses
};