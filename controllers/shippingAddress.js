const shippingAddressService = require('../services/shippingAddressService');
const orderService = require('../services/orderService');

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
    const result = await shippingAddressService.createShippingAddress(addressData, buyerResult.buyerId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(201).json({
      success: true,
      message: 'Shipping address created successfully',
      address: result.address
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
    const result = await shippingAddressService.getBuyerShippingAddresses(buyerResult.buyerId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      success: true,
      addresses: result.addresses
    });
  } catch (error) {
    console.error('Error retrieving shipping addresses:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving shipping addresses'
    });
  }
};

/**
 * Get a shipping address by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getShippingAddressById = async (req, res) => {
  try {
    const addressId = parseInt(req.params.id);
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
    
    // Get shipping address
    const result = await shippingAddressService.getShippingAddressById(addressId, buyerResult.buyerId);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      success: true,
      address: result.address
    });
  } catch (error) {
    console.error('Error retrieving shipping address:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving shipping address'
    });
  }
};

/**
 * Update a shipping address
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateShippingAddress = async (req, res) => {
  try {
    const addressId = parseInt(req.params.id);
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Verify user is a buyer
    if (userRole !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can update shipping addresses'
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
    
    // Update shipping address
    const addressData = req.body;
    const result = await shippingAddressService.updateShippingAddress(addressId, addressData, buyerResult.buyerId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Shipping address updated successfully',
      address: result.address
    });
  } catch (error) {
    console.error('Error updating shipping address:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating shipping address'
    });
  }
};

/**
 * Delete a shipping address
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteShippingAddress = async (req, res) => {
  try {
    const addressId = parseInt(req.params.id);
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Verify user is a buyer
    if (userRole !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can delete shipping addresses'
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
    
    // Delete shipping address
    const result = await shippingAddressService.deleteShippingAddress(addressId, buyerResult.buyerId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error deleting shipping address:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting shipping address'
    });
  }
};

/**
 * Set a shipping address as default
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const setDefaultShippingAddress = async (req, res) => {
  try {
    const addressId = parseInt(req.params.id);
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Verify user is a buyer
    if (userRole !== 'buyer') {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can set default shipping addresses'
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
    
    // Set default shipping address
    const result = await shippingAddressService.setDefaultShippingAddress(addressId, buyerResult.buyerId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Default shipping address set successfully',
      address: result.address
    });
  } catch (error) {
    console.error('Error setting default shipping address:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while setting default shipping address'
    });
  }
};

module.exports = {
  createShippingAddress,
  getMyShippingAddresses,
  getShippingAddressById,
  updateShippingAddress,
  deleteShippingAddress,
  setDefaultShippingAddress
};
