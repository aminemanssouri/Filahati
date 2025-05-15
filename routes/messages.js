const express = require('express');
const router = express.Router();
const { 
  createConversation,
  getConversations,
  getConversationById,
  getConversationByOrderId,
  sendMessage,
  getMessages,
  markMessageAsRead,
  deleteMessage
} = require('../controllers/message');
const { verifyToken } = require('../middlewares/auth');

// All routes require authentication
router.use(verifyToken);

/**
 * @route   POST /api/messages/conversations
 * @desc    Create a new conversation
 * @access  Private
 */
router.post('/conversations', createConversation);

/**
 * @route   GET /api/messages/conversations
 * @desc    Get all conversations for the authenticated user
 * @access  Private
 */
router.get('/conversations', getConversations);

/**
 * @route   GET /api/messages/conversations/:id
 * @desc    Get a specific conversation by ID
 * @access  Private
 */
router.get('/conversations/:id', getConversationById);

/**
 * @route   GET /api/messages/order/:orderId
 * @desc    Get conversation related to a specific order
 * @access  Private
 */
router.get('/order/:orderId', getConversationByOrderId);

/**
 * @route   POST /api/messages/conversations/:conversationId
 * @desc    Send a new message in a conversation
 * @access  Private
 */
router.post('/conversations/:conversationId', sendMessage);

/**
 * @route   GET /api/messages/conversations/:conversationId/messages
 * @desc    Get all messages in a conversation
 * @access  Private
 */
router.get('/conversations/:conversationId/messages', getMessages);

/**
 * @route   PUT /api/messages/:messageId/read
 * @desc    Mark a message as read
 * @access  Private
 */
router.put('/:messageId/read', markMessageAsRead);

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    Delete a message (soft delete)
 * @access  Private
 */
router.delete('/:messageId', deleteMessage);

module.exports = router;
