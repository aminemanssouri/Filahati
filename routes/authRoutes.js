const express = require('express');
const router = express.Router();
const { login, register, logout } = require('../controllers/auth');
const { verifyToken } = require('../middlewares/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (buyer or producer)
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user & clear cookie
 * @access  Private
 */
router.post('/logout', verifyToken, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', verifyToken, (req, res) => {
  // This route can be expanded later to fetch the complete user profile
  // including buyer or producer details
  res.status(200).json({
    message: 'User profile retrieved',
    userId: req.userId
  });
});

module.exports = router;
