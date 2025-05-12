const { Op } = require('sequelize');
const db = require('../models');
const { Order, OrderItem, Product, ShippingAddress, Buyer, City, Producer, Image } = db;

/**
 * Validate order data
 * @param {Object} data - Order data to validate
 * @returns {Object} - Validation result with success status and optional error message
 */
const validateOrderData = (data) => {
  const requiredFields = [
    'orderItems',      // Array of items in the order
    'paymentMethod',   // Payment method
    'shippingAddressId' // Shipping address ID
  ];

  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    return {
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  // Validate order items
  if (!Array.isArray(data.orderItems) || data.orderItems.length === 0) {
    return {
      success: false,
      message: 'Order must contain at least one item'
    };
  }
  
  // Check each order item has required fields
  for (const item of data.orderItems) {
    if (!item.productId || !item.quantity) {
      return {
        success: false,
        message: 'Each order item must have productId and quantity'
      };
    }
    
    // Ensure quantity is positive
    if (item.quantity <= 0) {
      return {
        success: false,
        message: 'Quantity must be greater than zero'
      };
    }
  }
  
  return { success: true };
};

/**
 * Get buyer by user ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - Object containing success status and buyer ID or error message
 */
const getBuyerByUserId = async (userId) => {
  try {
    const buyer = await Buyer.findOne({ where: { userId } });
    
    if (!buyer) {
      return { success: false, message: "Buyer not found" };
    }
    
    return { success: true, buyerId: buyer.id, buyer };
  } catch (error) {
    return { success: false, message: "Error finding buyer: " + error.message };
  }
};

// This function has been moved to shippingAddressService.js
// Keeping a reference here to maintain backward compatibility
const getShippingAddressById = async (shippingAddressId, buyerId) => {
  const shippingAddressService = require('./shippingAddressService');
  return await shippingAddressService.getShippingAddressById(shippingAddressId, buyerId);
};

/**
 * Calculate order total and validate products
 * @param {Array} orderItems - Array of order items with productId and quantity
 * @returns {Promise<Object>} - Object with success status, total amount, and validated items or error message
 */
const calculateOrderTotal = async (orderItems) => {
  try {
    const validatedItems = [];
    let totalAmount = 0;
    
    // Process each item and calculate totals
    for (const item of orderItems) {
      const product = await Product.findByPk(item.productId);
      
      if (!product) {
        return { success: false, message: `Product with ID ${item.productId} not found` };
      }
      
      const unitPrice = parseFloat(product.price);
      const quantity = parseInt(item.quantity);
      const subtotal = unitPrice * quantity;
      
      validatedItems.push({
        productId: item.productId,
        quantity,
        unitPrice,
        subtotal,
        producerNotes: item.producerNotes || null,
        buyerNotes: item.buyerNotes || null
      });
      
      totalAmount += subtotal;
    }
    
    return { 
      success: true, 
      totalAmount, 
      validatedItems 
    };
  } catch (error) {
    return { success: false, message: "Error calculating order total: " + error.message };
  }
};

/**
 * Create order items for an order
 * @param {Array} items - Validated order items
 * @param {number} orderId - Order ID
 * @param {Object} transaction - Sequelize transaction
 * @returns {Promise<Object>} - Success status and message
 */
const createOrderItems = async (items, orderId, transaction) => {
  try {
    // Use Promise.all for better performance with multiple items
    await Promise.all(items.map(item => {
      return OrderItem.create({
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        producerNotes: item.producerNotes,
        buyerNotes: item.buyerNotes
      }, { transaction });
    }));
    
    return { success: true };
  } catch (error) {
    throw new Error("Failed to create order items: " + error.message);
  }
};

/**
 * Create a new order with items
 * @param {Object} orderData - Order data
 * @param {number} buyerId - Buyer ID
 * @returns {Promise<Object>} - Created order or error message
 */
const createOrder = async (orderData, buyerId) => {
  // Validate order data
  const validation = validateOrderData(orderData);
  if (!validation.success) {
    return { success: false, message: validation.message };
  }
  
  // Start transaction
  const transaction = await db.sequelize.transaction();
  
  try {
    // Verify shipping address belongs to buyer
    const shippingAddressResult = await getShippingAddressById(orderData.shippingAddressId, buyerId);
    if (!shippingAddressResult.success) {
      await transaction.rollback();
      return shippingAddressResult;
    }
    
    // Calculate order total and validate products
    const calculationResult = await calculateOrderTotal(orderData.orderItems);
    if (!calculationResult.success) {
      await transaction.rollback();
      return calculationResult;
    }
    
    // Create the order
    const order = await Order.create({
      buyerId,
      shippingAddressId: orderData.shippingAddressId,
      orderDate: new Date(),
      totalAmount: calculationResult.totalAmount,
      status: 'Pending',
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'Pending',
      shippingCost: orderData.shippingCost || 0,
      deliveryDate: orderData.deliveryDate || null,
      notes: orderData.notes || null
    }, { transaction });
    
    // Create order items
    await createOrderItems(calculationResult.validatedItems, order.orderId, transaction);
    
    // Commit transaction
    await transaction.commit();
    
    // Return the created order with items
    const createdOrder = await getOrderById(order.orderId);
    return { success: true, order: createdOrder };
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    return { success: false, message: "Failed to create order: " + error.message };
  }
};

/**
 * Get order by ID with all related data
 * @param {number} orderId - Order ID
 * @param {number} [buyerId] - Optional buyer ID for authorization
 * @returns {Promise<Object>} - Order with items and related data
 */
const getOrderById = async (orderId, buyerId = null) => {
  try {
    // Validate orderId is a number
    if (!orderId || isNaN(parseInt(orderId))) {
      return { success: false, message: 'Invalid order ID' };
    }
    
    const parsedOrderId = parseInt(orderId);
    const whereClause = { orderId: parsedOrderId };
    if (buyerId) {
      whereClause.buyerId = buyerId;
    }
    
    const order = await Order.findOne({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          include: [{
            model: Product,
            include: [
              { model: Producer, attributes: ['id'] },
              { model: Image }
            ]
          }]
        },
        {
          model: ShippingAddress,
          include: [{ model: City, attributes: ['id', 'cityName'] }]
        },
        { model: Buyer }
      ]
    });
    
    if (!order) {
      return { success: false, message: 'Order not found' };
    }
    
    return { success: true, order };
  } catch (error) {
    return { success: false, message: "Error retrieving order: " + error.message };
  }
};

/**
 * Get all orders for a buyer with pagination
 * @param {number} buyerId - Buyer ID
 * @param {Object} options - Query options (page, limit, status)
 * @returns {Promise<Object>} - Paginated orders
 */
const getBuyerOrders = async (buyerId, options = {}) => {
  try {
    // Ensure we have valid numeric values for pagination
    const page = options.page && !isNaN(parseInt(options.page)) ? parseInt(options.page) : 1;
    const limit = options.limit && !isNaN(parseInt(options.limit)) ? parseInt(options.limit) : 10;
    const offset = (page - 1) * limit;
    
    // Build where clause
    const whereClause = { buyerId };
    
    // Add status filter if provided
    if (options.status) {
      whereClause.status = options.status;
    }

    // Query with pagination
    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['orderDate', 'DESC']],
      include: [
        {
          model: OrderItem,
          include: [{
            model: Product,
            attributes: ['ProductsId', 'title', 'price'],
            include: [{ model: Image }]
          }]
        },
        {
          model: ShippingAddress,
          attributes: ['id', 'contactName', 'addressLine1', 'postalCode'],
          include: [{ model: City, attributes: ['id', 'cityName'] }]
        }
      ]
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);

    return {
      success: true,
      orders: rows,
      pagination: {
        total: count,
        totalPages,
        currentPage: page,
        limit
      }
    };
  } catch (error) {
    return { success: false, message: "Error retrieving buyer orders: " + error.message };
  }
};

/**
 * Update order status
 * @param {number} orderId - Order ID
 * @param {string} status - New order status
 * @param {number} [buyerId] - Optional buyer ID for authorization
 * @returns {Promise<Object>} - Updated order
 */
const updateOrderStatus = async (orderId, status, buyerId = null) => {
  try {
    // Validate status
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return { 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      };
    }
    
    // Find order
    const whereClause = { orderId };
    if (buyerId) {
      whereClause.buyerId = buyerId;
    }
    
    const order = await Order.findOne({ where: whereClause });
    
    if (!order) {
      return { 
        success: false, 
        message: 'Order not found or you are not authorized to update it' 
      };
    }
    
    // Update status
    await order.update({ status });
    
    // Return updated order
    return getOrderById(orderId, buyerId);
  } catch (error) {
    return { success: false, message: "Error updating order status: " + error.message };
  }
};

/**
 * Cancel an order (can only be done by the buyer)
 * @param {number} orderId - Order ID
 * @param {number} buyerId - Buyer ID for authorization
 * @returns {Promise<Object>} - Cancelled order
 */
const cancelOrder = async (orderId, buyerId) => {
  try {
    // Find order
    const order = await Order.findOne({
      where: { orderId, buyerId }
    });
    
    if (!order) {
      return { 
        success: false, 
        message: 'Order not found or you are not authorized to cancel it' 
      };
    }
    
    // Only allow cancellation of pending or processing orders
    if (!['Pending', 'Processing'].includes(order.status)) {
      return { 
        success: false, 
        message: `Cannot cancel order with status: ${order.status}` 
      };
    }
    
    // Update status
    await order.update({
      status: 'Cancelled',
      notes: order.notes ? `${order.notes}\nCancelled by buyer` : 'Cancelled by buyer'
    });
    
    // Return updated order
    const result = await getOrderById(orderId, buyerId);
    return result;
  } catch (error) {
    return { success: false, message: "Error cancelling order: " + error.message };
  }
};


module.exports = {
  validateOrderData,
  getBuyerByUserId,
  getShippingAddressById,
  calculateOrderTotal,
  createOrderItems,
  createOrder,
  getOrderById,
  getBuyerOrders,
  updateOrderStatus,
  cancelOrder
};
