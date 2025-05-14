const { Buyer } = require('../models');
const reviewService = require('../services/reviewService');

/**
 * Create a new review
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Response
 */
const CreateReview = async (req, res) => {
  try {
    // Only authenticated users can create reviews
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Validate input data
    const validationResult = reviewService.validateReviewData(req.body);
    if (!validationResult.isValid) {
      return res.status(400).json({ message: validationResult.message });
    }

    // Create the review
    const review = await reviewService.createReview(req.body, req.userId);

    return res.status(201).json({
      message: "Review created successfully",
      review
    });

  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(error.message.includes("already reviewed") ? 400 : 500).json({
      message: error.message || "An error occurred while creating the review"
    });
  }
};

/**
 * Get a review by its ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Response
 */
const GetReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Review ID is required" });
    }
    
    const review = await reviewService.getReviewById(id);
    
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    
    return res.status(200).json({
      review
    });
    
  } catch (error) {
    console.error("Error getting review:", error);
    return res.status(500).json({
      message: "An error occurred while getting the review",
      error: error.message
    });
  }
};

/**
 * Get reviews by product ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Response
 */
const GetReviewsByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    
    const reviews = await reviewService.getReviewsByProductId(productId);
    const averageRating = await reviewService.calculateProductRating(productId);
    
    return res.status(200).json({
      count: reviews.length,
      averageRating,
      reviews
    });
    
  } catch (error) {
    console.error("Error getting reviews:", error);
    return res.status(500).json({
      message: "An error occurred while getting the reviews",
      error: error.message
    });
  }
};

/**
 * Get reviews by the authenticated user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Response
 */
const GetMyReviews = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const reviews = await reviewService.getReviewsByUserId(req.userId);
    
    return res.status(200).json({
      count: reviews.length,
      reviews
    });
    
  } catch (error) {
    console.error("Error getting reviews:", error);
    return res.status(500).json({
      message: "An error occurred while getting your reviews",
      error: error.message
    });
  }
};

/**
 * Update a review
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Response
 */
const UpdateReview = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Review ID is required" });
    }
    
    const result = await reviewService.updateReviewById(id, req.body, req.userId);
    
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }
    
    return res.status(200).json({
      message: "Review updated successfully",
      review: result.review
    });
    
  } catch (error) {
    console.error("Error updating review:", error);
    return res.status(500).json({
      message: "An error occurred while updating the review",
      error: error.message
    });
  }
};

/**
 * Delete a review
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<Object>} - Response
 */
const DeleteReview = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Review ID is required" });
    }
    
    const result = await reviewService.deleteReviewById(id, req.userId);
    
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }
    
    return res.status(200).json({
      message: result.message
    });
    
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({
      message: "An error occurred while deleting the review",
      error: error.message
    });
  }
};

module.exports = {
  CreateReview,
  GetReviewById,
  GetReviewsByProductId,
  GetMyReviews,
  UpdateReview,
  DeleteReview
};
