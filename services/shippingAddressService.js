const { Op } = require('sequelize');
const db = require('../models');
const { ShippingAddress, Buyer, City } = db;

/**
 * Get all shipping addresses for a buyer
 * @param {number} buyerId - Buyer ID
 * @returns {Promise<Object>} - List of shipping addresses
 */
const getBuyerShippingAddresses = async (buyerId) => {
  try {
    const addresses = await ShippingAddress.findAll({
      where: { buyerId },
      include: [{ model: City, attributes: ['id', 'cityName'] }],
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });
    
    return {
      success: true,
      addresses
    };
  } catch (error) {
    return { 
      success: false, 
      message: "Error retrieving shipping addresses: " + error.message 
    };
  }
};

/**
 * Get shipping address by ID and verify it belongs to the buyer
 * @param {number} shippingAddressId - Shipping address ID
 * @param {number} buyerId - Buyer ID for verification
 * @returns {Promise<Object>} - Object containing success status and shipping address or error message
 */
const getShippingAddressById = async (shippingAddressId, buyerId) => {
  try {
    const address = await ShippingAddress.findOne({
      where: { 
        id: shippingAddressId,
        buyerId 
      },
      include: [{ model: City, attributes: ['id', 'cityName'] }]
    });
    
    if (!address) {
      return { success: false, message: "Shipping address not found or does not belong to this buyer" };
    }
    
    return { success: true, address };
  } catch (error) {
    return { success: false, message: "Error finding shipping address: " + error.message };
  }
};

/**
 * Create a new shipping address for a buyer
 * @param {Object} addressData - Shipping address data
 * @param {number} buyerId - Buyer ID
 * @returns {Promise<Object>} - Created shipping address
 */
const createShippingAddress = async (addressData, buyerId) => {
  try {
    // Validate required fields
    const requiredFields = [
      'addressLine1',
      'postalCode',
      'contactNumber',
      'contactName',
      'cityId'
    ];
    
    const missingFields = requiredFields.filter(field => !addressData[field]);
    
    if (missingFields.length > 0) {
      return {
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      };
    }
    
    // Create shipping address
    const address = await ShippingAddress.create({
      ...addressData,
      buyerId
    });
    
    // If this is marked as default or it's the first address, update buyer's default address
    if (addressData.isDefault || addressData.isDefault === undefined) {
      // Check if this is the first address or explicitly set as default
      const addressCount = await ShippingAddress.count({ where: { buyerId } });
      
      if (addressCount === 1 || addressData.isDefault) {
        // Set as default
        await address.update({ isDefault: true });
        
        // Update buyer's default shipping address
        await Buyer.update(
          { shippingAddressId: address.id },
          { where: { id: buyerId } }
        );
      }
    }
    
    // Return created address with city information
    const createdAddress = await ShippingAddress.findByPk(address.id, {
      include: [{ model: City, attributes: ['id', 'cityName'] }]
    });
    
    return {
      success: true,
      address: createdAddress
    };
  } catch (error) {
    return { 
      success: false, 
      message: "Error creating shipping address: " + error.message 
    };
  }
};

/**
 * Update a shipping address
 * @param {number} addressId - Shipping address ID
 * @param {Object} addressData - Updated shipping address data
 * @param {number} buyerId - Buyer ID for authorization
 * @returns {Promise<Object>} - Updated shipping address
 */
const updateShippingAddress = async (addressId, addressData, buyerId) => {
  try {
    // Find the address
    const address = await ShippingAddress.findOne({
      where: { 
        id: addressId,
        buyerId 
      }
    });
    
    if (!address) {
      return { 
        success: false, 
        message: "Shipping address not found or does not belong to this buyer" 
      };
    }
    
    // Update the address
    await address.update(addressData);
    
    // If this address is set as default, update all other addresses to not be default
    if (addressData.isDefault) {
      await ShippingAddress.update(
        { isDefault: false },
        { 
          where: { 
            buyerId,
            id: { [Op.ne]: addressId }
          }
        }
      );
      
      // Update buyer's default shipping address
      await Buyer.update(
        { shippingAddressId: addressId },
        { where: { id: buyerId } }
      );
    }
    
    // Return updated address with city information
    const updatedAddress = await ShippingAddress.findByPk(addressId, {
      include: [{ model: City, attributes: ['id', 'cityName'] }]
    });
    
    return {
      success: true,
      address: updatedAddress
    };
  } catch (error) {
    return { 
      success: false, 
      message: "Error updating shipping address: " + error.message 
    };
  }
};

/**
 * Delete a shipping address
 * @param {number} addressId - Shipping address ID
 * @param {number} buyerId - Buyer ID for authorization
 * @returns {Promise<Object>} - Result of deletion
 */
const deleteShippingAddress = async (addressId, buyerId) => {
  try {
    // Find the address
    const address = await ShippingAddress.findOne({
      where: { 
        id: addressId,
        buyerId 
      }
    });
    
    if (!address) {
      return { 
        success: false, 
        message: "Shipping address not found or does not belong to this buyer" 
      };
    }
    
    // Check if this is the default address
    if (address.isDefault) {
      // Find another address to set as default
      const anotherAddress = await ShippingAddress.findOne({
        where: { 
          buyerId,
          id: { [Op.ne]: addressId }
        }
      });
      
      if (anotherAddress) {
        // Set another address as default
        await anotherAddress.update({ isDefault: true });
        
        // Update buyer's default shipping address
        await Buyer.update(
          { shippingAddressId: anotherAddress.id },
          { where: { id: buyerId } }
        );
      } else {
        // No other addresses, update buyer to have no default address
        await Buyer.update(
          { shippingAddressId: null },
          { where: { id: buyerId } }
        );
      }
    }
    
    // Delete the address
    await address.destroy();
    
    return {
      success: true,
      message: "Shipping address deleted successfully"
    };
  } catch (error) {
    return { 
      success: false, 
      message: "Error deleting shipping address: " + error.message 
    };
  }
};

/**
 * Set a shipping address as default
 * @param {number} addressId - Shipping address ID
 * @param {number} buyerId - Buyer ID for authorization
 * @returns {Promise<Object>} - Updated shipping address
 */
const setDefaultShippingAddress = async (addressId, buyerId) => {
  try {
    // Find the address
    const address = await ShippingAddress.findOne({
      where: { 
        id: addressId,
        buyerId 
      }
    });
    
    if (!address) {
      return { 
        success: false, 
        message: "Shipping address not found or does not belong to this buyer" 
      };
    }
    
    // Update all addresses to not be default
    await ShippingAddress.update(
      { isDefault: false },
      { where: { buyerId } }
    );
    
    // Set this address as default
    await address.update({ isDefault: true });
    
    // Update buyer's default shipping address
    await Buyer.update(
      { shippingAddressId: addressId },
      { where: { id: buyerId } }
    );
    
    // Return updated address with city information
    const updatedAddress = await ShippingAddress.findByPk(addressId, {
      include: [{ model: City, attributes: ['id', 'cityName'] }]
    });
    
    return {
      success: true,
      address: updatedAddress
    };
  } catch (error) {
    return { 
      success: false, 
      message: "Error setting default shipping address: " + error.message 
    };
  }
};

module.exports = {
  getBuyerShippingAddresses,
  getShippingAddressById,
  createShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
  setDefaultShippingAddress
};
