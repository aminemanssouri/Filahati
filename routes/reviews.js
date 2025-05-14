const express = require('express');
const router = express.Router();
const { 
  CreateReview, 
  GetReviewById, 
  GetReviewsByProductId, 
  GetMyReviews, 
  UpdateReview, 
  DeleteReview 
} = require('../controllers/reviews');
const { verifyToken } = require('../middlewares/auth');

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private (Authenticated users only)
 */
router.post('/', verifyToken, CreateReview);

/**
 * @route   GET /api/reviews/:id
 * @desc    Get a review by ID
 * @access  Public
 */
router.get('/:id', GetReviewById);

/**
 * @route   GET /api/reviews/product/:productId
 * @desc    Get all reviews for a specific product
 * @access  Public
 */
router.get('/product/:productId', GetReviewsByProductId);

/**
 * @route   GET /api/reviews/my/reviews
 * @desc    Get all reviews by the authenticated user
 * @access  Private (Authenticated users only)
 */
router.get('/my/reviews', verifyToken, GetMyReviews);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update a review
 * @access  Private (Review owner only)
 */
router.put('/:id', verifyToken, UpdateReview);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Private (Review owner only)
 */
router.delete('/:id', verifyToken, DeleteReview);

module.exports = router;
