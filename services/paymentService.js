const { Payment, Order } = require('../models');
const { sequelize } = require('../models');

/**
 * Create a new payment record
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} Created payment
 */
const createPayment = async (paymentData) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Create the payment record
    const payment = await Payment.create(paymentData, { transaction });
    
    // Update the order's payment status
    await Order.update(
      { 
        paymentStatus: paymentData.paymentStatus,
        status: paymentData.paymentStatus === 'Completed' ? 'Processing' : 'Pending'
      },
      { 
        where: { orderId: paymentData.orderId },
        transaction
      }
    );
    
    await transaction.commit();
    return payment;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Get payment by ID
 * @param {number} paymentId - Payment ID
 * @returns {Promise<Object>} Payment data
 */
const getPaymentById = async (paymentId) => {
  return await Payment.findByPk(paymentId);
};

/**
 * Get payments by order ID
 * @param {number} orderId - Order ID
 * @returns {Promise<Array>} List of payments
 */
const getPaymentsByOrderId = async (orderId) => {
  return await Payment.findAll({
    where: { orderId },
    order: [['paymentDate', 'DESC']]
  });
};

/**
 * Update payment status
 * @param {number} paymentId - Payment ID
 * @param {string} paymentStatus - New payment status
 * @param {string} transactionId - Transaction ID from payment provider
 * @returns {Promise<Object>} Updated payment
 */
const updatePaymentStatus = async (paymentId, paymentStatus, transactionId = null) => {
  const transaction = await sequelize.transaction();
  
  try {
    const payment = await Payment.findByPk(paymentId, { transaction });
    
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    // Update payment status
    payment.paymentStatus = paymentStatus;
    if (transactionId) {
      payment.transactionId = transactionId;
    }
    
    await payment.save({ transaction });
    
    // Update the order's payment status
    await Order.update(
      { 
        paymentStatus,
        status: paymentStatus === 'Completed' ? 'Processing' : 
                paymentStatus === 'Failed' ? 'Cancelled' : 
                'Pending'
      },
      { 
        where: { orderId: payment.orderId },
        transaction
      }
    );
    
    await transaction.commit();
    return payment;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Process a payment through a payment gateway
 * This is a placeholder for actual payment processing logic
 * In a real application, this would integrate with a payment gateway API
 * @param {Object} paymentData - Payment data including card details, amount, etc.
 * @returns {Promise<Object>} Payment processing result
 */
const processPayment = async (paymentData) => {
  // This is a placeholder for actual payment gateway integration
  // In a real application, you would call a payment gateway API here
  
  // Simulate payment processing
  const isSuccessful = Math.random() > 0.1; // 90% success rate for simulation
  
  // Generate a mock transaction ID
  const transactionId = isSuccessful ? 
    `TXN_${Date.now()}_${Math.floor(Math.random() * 1000000)}` : 
    null;
  
  return {
    success: isSuccessful,
    transactionId,
    status: isSuccessful ? 'Completed' : 'Failed',
    message: isSuccessful ? 'Payment processed successfully' : 'Payment processing failed'
  };
};

module.exports = {
  createPayment,
  getPaymentById,
  getPaymentsByOrderId,
  updatePaymentStatus,
  processPayment
};
