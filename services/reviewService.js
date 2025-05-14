const { Review, Product, User, Buyer } = require('../models');

/**
 * Validate review input data
 * @param {Object} data - Review data
 * @returns {Object} - Validation result
 */
const validateReviewData = (data) => {
  const { starNumber, productId } = data;
  
  if (!starNumber || !productId) {
    return { 
      isValid: false, 
      message: "Star rating and product ID are required" 
    };
  }
  
  if (starNumber < 1 || starNumber > 5) {
    return {
      isValid: false,
      message: "Star rating must be between 1 and 5"
    };
  }
  
  return { isValid: true };
};

/**
 * Create a new review
 * @param {Object} data - Review data
 * @param {Number} userId - User ID of the reviewer
 * @returns {Promise<Object>} - Created review
 */
const createReview = async (data, userId) => {
  const { starNumber, text, productId } = data;
  
  // Check if product exists
  const product = await Product.findByPk(productId);
  if (!product) {
    throw new Error("Product not found");
  }
  
  // Check if user has already reviewed this product
  const existingReview = await Review.findOne({
    where: { 
      productId,
      userId
    }
  });
  
  if (existingReview) {
    throw new Error("You have already reviewed this product");
  }
  
  // Create the review
  return await Review.create({
    starNumber,
    text: text || null,
    productId,
    userId
  });
};

/**
 * Get review by ID
 * @param {Number} reviewId - Review ID
 * @returns {Promise<Object>} - Review with associations
 */
const getReviewById = async (reviewId) => {
  return await Review.findByPk(reviewId, {
    include: [
      { 
        model: Product,
        attributes: ['ProductsId', 'title'] 
      }
    ]
  });
};

/**
 * Get reviews by product ID
 * @param {Number} productId - Product ID
 * @returns {Promise<Array>} - Array of reviews
 */
const getReviewsByProductId = async (productId) => {
  return await Review.findAll({
    where: { productId },
    include: [
      {
        model: User,
        attributes: ['firstName', 'lastName']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
};

/**
 * Get reviews by user ID
 * @param {Number} userId - User ID
 * @returns {Promise<Array>} - Array of reviews
 */
const getReviewsByUserId = async (userId) => {
  return await Review.findAll({
    where: { userId },
    include: [
      { 
        model: Product,
        attributes: ['ProductsId', 'title', 'price'] 
      }
    ],
    order: [['createdAt', 'DESC']]
  });
};

/**
 * Update review by ID
 * @param {Number} reviewId - Review ID
 * @param {Object} data - Updated review data
 * @param {Number} userId - User ID (for authorization)
 * @returns {Promise<Object>} - Updated review or error
 */
const updateReviewById = async (reviewId, data, userId) => {
  // First check if review exists and belongs to the user
  const review = await Review.findOne({
    where: {
      reviewId,
      userId
    }
  });

  if (!review) {
    return { success: false, message: "Review not found or you don't have permission to update it" };
  }

  const { starNumber, text } = data;

  // Validate star number
  if (starNumber && (starNumber < 1 || starNumber > 5)) {
    return { success: false, message: "Star rating must be between 1 and 5" };
  }

  // Update the review
  await review.update({
    starNumber: starNumber || review.starNumber,
    text: text !== undefined ? text : review.text
  });

  // Return the updated review
  const updatedReview = await getReviewById(reviewId);
  return { success: true, review: updatedReview };
};

/**
 * Delete review by ID
 * @param {Number} reviewId - Review ID
 * @param {Number} userId - User ID (for authorization)
 * @returns {Promise<Object>} - Result of deletion
 */
const deleteReviewById = async (reviewId, userId) => {
  // First check if review exists and belongs to the user
  const review = await Review.findOne({
    where: {
      reviewId,
      userId
    }
  });

  if (!review) {
    return { success: false, message: "Review not found or you don't have permission to delete it" };
  }

  // Delete the review
  await review.destroy();
  
  return { success: true, message: "Review deleted successfully" };
};

/**
 * Calculate average rating for a product
 * @param {Number} productId - Product ID
 * @returns {Promise<Number>} - Average rating
 */
const calculateProductRating = async (productId) => {
  const reviews = await Review.findAll({
    where: { productId },
    attributes: ['starNumber']
  });
  
  if (reviews.length === 0) {
    return 0;
  }
  
  const sum = reviews.reduce((total, review) => total + review.starNumber, 0);
  return (sum / reviews.length).toFixed(1);
};

module.exports = {
  validateReviewData,
  createReview,
  getReviewById,
  getReviewsByProductId,
  getReviewsByUserId,
  updateReviewById,
  deleteReviewById,
  calculateProductRating
};
