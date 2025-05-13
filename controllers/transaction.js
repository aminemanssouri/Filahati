const transactionService = require('../services/transactionService');
const orderService = require('../services/orderService');

/**
 * Create a new transaction
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createTransaction = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Verify user is a buyer or admin
    if (userRole !== 'buyer' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only buyers or admins can create transactions'
      });
    }
    
    // If user is a buyer, verify they own the order
    if (userRole === 'buyer') {
      const { orderId } = req.body;
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required'
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
      
      // Check if order belongs to buyer
      const orderResult = await orderService.getOrderById(orderId, buyerResult.buyerId);
      
      if (!orderResult.success) {
        return res.status(404).json({
          success: false,
          message: 'Order not found or does not belong to you'
        });
      }
    }
    
    // Create transaction
    const transactionData = req.body;
    const result = await transactionService.createTransaction(transactionData);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      transaction: result.transaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating the transaction'
    });
  }
};

/**
 * Get transaction by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTransactionById = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Get transaction
    const result = await transactionService.getTransactionById(transactionId);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }
    
    // If user is a buyer, verify they own the order associated with the transaction
    if (userRole === 'buyer') {
      const buyerResult = await orderService.getBuyerByUserId(userId);
      
      if (!buyerResult.success) {
        return res.status(400).json({
          success: false,
          message: buyerResult.message
        });
      }
      
      // Check if order belongs to buyer
      const orderResult = await orderService.getOrderById(result.transaction.orderId, buyerResult.buyerId);
      
      if (!orderResult.success) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this transaction'
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      transaction: result.transaction
    });
  } catch (error) {
    console.error('Error retrieving transaction:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving the transaction'
    });
  }
};

/**
 * Get all transactions for an order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTransactionsByOrderId = async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    
    // Validate orderId
    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }
    
    const userId = req.userId;
    const userRole = req.userRole;
    
    // If user is a buyer, verify they own the order
    if (userRole === 'buyer') {
      const buyerResult = await orderService.getBuyerByUserId(userId);
      
      if (!buyerResult.success) {
        return res.status(400).json({
          success: false,
          message: buyerResult.message
        });
      }
      
      // Check if order belongs to buyer
      const orderResult = await orderService.getOrderById(orderId, buyerResult.buyerId);
      
      if (!orderResult.success) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view transactions for this order'
        });
      }
    }
    
    // Get transactions
    const result = await transactionService.getTransactionsByOrderId(orderId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      success: true,
      transactions: result.transactions
    });
  } catch (error) {
    console.error('Error retrieving transactions:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving transactions'
    });
  }
};

/**
 * Update transaction status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateTransactionStatus = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { status } = req.body;
    
    // Validate status
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Only admins can update transaction status
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only admins can update transaction status'
      });
    }
    
    // Update transaction status
    const result = await transactionService.updateTransactionStatus(transactionId, status);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Transaction status updated successfully',
      transaction: result.transaction
    });
  } catch (error) {
    console.error('Error updating transaction status:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating transaction status'
    });
  }
};

/**
 * Generate a new transaction ID (UUID)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateTransactionId = async (req, res) => {
  try {
    const transactionId = transactionService.generateTransactionId();
    
    return res.status(200).json({
      success: true,
      transactionId
    });
  } catch (error) {
    console.error('Error generating transaction ID:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while generating transaction ID'
    });
  }
};

module.exports = {
  createTransaction,
  getTransactionById,
  getTransactionsByOrderId,
  updateTransactionStatus,
  generateTransactionId
};
