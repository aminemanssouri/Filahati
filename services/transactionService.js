const { Transaction, Order, Payment } = require('../models');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new transaction
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<Object>} - Created transaction
 */
const createTransaction = async (transactionData) => {
  try {
    // Validate required fields
    if (!transactionData.orderId || !transactionData.amount || !transactionData.paymentMethod) {
      return {
        success: false,
        message: 'Missing required fields: orderId, amount, and paymentMethod are required'
      };
    }

    // Check if order exists
    const order = await Order.findByPk(transactionData.orderId);
    if (!order) {
      return {
        success: false,
        message: 'Order not found'
      };
    }

    // Generate a UUID if not provided
    if (!transactionData.externalTransactionId) {
      transactionData.externalTransactionId = uuidv4();
    }

    // Create transaction
    const transaction = await Transaction.create(transactionData);

    return {
      success: true,
      transaction
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error creating transaction: ' + error.message
    };
  }
};

/**
 * Get transaction by ID
 * @param {string} transactionId - Transaction ID (UUID)
 * @returns {Promise<Object>} - Transaction
 */
const getTransactionById = async (transactionId) => {
  try {
    const transaction = await Transaction.findByPk(transactionId);
    
    if (!transaction) {
      return {
        success: false,
        message: 'Transaction not found'
      };
    }
    
    return {
      success: true,
      transaction
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error retrieving transaction: ' + error.message
    };
  }
};

/**
 * Get all transactions for an order
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} - Transactions
 */
const getTransactionsByOrderId = async (orderId) => {
  try {
    // Check if order exists
    const order = await Order.findByPk(orderId);
    if (!order) {
      return {
        success: false,
        message: 'Order not found'
      };
    }
    
    const transactions = await Transaction.findAll({
      where: { orderId },
      order: [['transactionDate', 'DESC']]
    });
    
    return {
      success: true,
      transactions
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error retrieving transactions: ' + error.message
    };
  }
};

/**
 * Update transaction status
 * @param {string} transactionId - Transaction ID (UUID)
 * @param {string} status - New status
 * @returns {Promise<Object>} - Updated transaction
 */
const updateTransactionStatus = async (transactionId, status) => {
  try {
    const transaction = await Transaction.findByPk(transactionId);
    
    if (!transaction) {
      return {
        success: false,
        message: 'Transaction not found'
      };
    }
    
    // Validate status
    const validStatuses = ['Pending', 'Completed', 'Failed'];
    if (!validStatuses.includes(status)) {
      return {
        success: false,
        message: `Invalid status. Status must be one of: ${validStatuses.join(', ')}`
      };
    }
    
    // Update transaction status
    await transaction.update({ status });
    
    // If transaction is completed and it's a payment, update the payment status
    if (status === 'Completed' && transaction.transactionType === 'Payment') {
      // Find related payment by orderId and update its status
      const payment = await Payment.findOne({ where: { orderId: transaction.orderId } });
      if (payment) {
        await payment.update({ 
          paymentStatus: 'Completed',
          transactionId: transaction.externalTransactionId
        });
      }
    }
    
    return {
      success: true,
      transaction
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error updating transaction status: ' + error.message
    };
  }
};

/**
 * Generate a new transaction ID (UUID)
 * @returns {string} - UUID
 */
const generateTransactionId = () => {
  return uuidv4();
};

module.exports = {
  createTransaction,
  getTransactionById,
  getTransactionsByOrderId,
  updateTransactionStatus,
  generateTransactionId
};
