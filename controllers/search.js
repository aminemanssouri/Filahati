const productService = require('../services/productService');
const { ValidationError } = require('../utils/errors');

/**
 * Search for products using full-text search
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const SearchProducts = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      throw new ValidationError('Search query is required');
    }
    
    // Use the full-text search functionality
    const products = await productService.searchProducts(query);
    
    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  SearchProducts
};
