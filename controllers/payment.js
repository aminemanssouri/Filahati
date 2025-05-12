const paymentService = require('../services/paymentService');
const { Order } = require('../models');

/**
 * Create a new payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createPayment = async (req, res) => {
  try {
    const { orderId, amount, paymentMethod, paymentDetails } = req.body;
    
    // Validate required fields
    if (!orderId || !amount || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID, amount, and payment method are required' 
      });
    }
    
    // Check if order exists
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Check if order belongs to the authenticated user
    if (order.buyerId !== req.user.buyerId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to make payment for this order' 
      });
    }
    
    // Process the payment through payment gateway
    const paymentResult = await paymentService.processPayment({
      orderId,
      amount,
      paymentMethod,
      paymentDetails
    });
    
    // Create payment record
    const payment = await paymentService.createPayment({
      orderId,
      amount,
      paymentMethod,
      paymentStatus: paymentResult.status,
      transactionId: paymentResult.transactionId,
      paymentDetails
    });
    
    return res.status(201).json({
      success: true,
      message: paymentResult.message,
      payment: {
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.paymentStatus,
        transactionId: payment.transactionId,
        paymentDate: payment.paymentDate
      }
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to process payment', 
      error: error.message 
    });
  }
};

/**
 * Get payment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await paymentService.getPaymentById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }
    
    // Check if payment belongs to the authenticated user
    const order = await Order.findByPk(payment.orderId);
    if (order.buyerId !== req.user.buyerId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to view this payment' 
      });
    }
    
    return res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Error getting payment:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to get payment', 
      error: error.message 
    });
  }
};

/**
 * Get payments by order ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPaymentsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Check if order exists
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Check if order belongs to the authenticated user
    if (order.buyerId !== req.user.buyerId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to view payments for this order' 
      });
    }
    
    const payments = await paymentService.getPaymentsByOrderId(orderId);
    
    return res.status(200).json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Error getting payments:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to get payments', 
      error: error.message 
    });
  }
};

/**
 * Update payment status (for webhook callbacks from payment gateways)
 * This would typically be called by a payment gateway webhook
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentStatus, transactionId } = req.body;
    
    if (!paymentStatus) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment status is required' 
      });
    }
    
    const payment = await paymentService.updatePaymentStatus(
      paymentId,
      paymentStatus,
      transactionId
    );
    
    return res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      payment: {
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        paymentStatus: payment.paymentStatus,
        transactionId: payment.transactionId
      }
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update payment status', 
      error: error.message 
    });
  }
};

/**
 * Get transactions by order ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTransactionsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Check if order exists
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Check if order belongs to the authenticated user
    if (order.buyerId !== req.user.buyerId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to view transactions for this order' 
      });
    }
    
    const { Transaction } = require('../models');
    const transactions = await Transaction.findAll({
      where: { orderId },
      order: [['transactionDate', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to get transactions', 
      error: error.message 
    });
  }
};

module.exports = {
  createPayment,
  getPaymentById,
  getPaymentsByOrderId,
  updatePaymentStatus,
  getTransactionsByOrderId
};
