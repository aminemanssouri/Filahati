const messageService = require('../services/messageService');
const { User } = require('../models');

/**
 * Create a new conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createConversation = async (req, res) => {
  try {
    const { topic, participantIds, orderId } = req.body;
    
    // Validate required fields
    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Conversation topic is required'
      });
    }
    
    // Check if participants exist
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one participant is required'
      });
    }
    
    // Verify all participants exist
    const users = await User.findAll({
      where: { id: participantIds }
    });
    
    if (users.length !== participantIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more participants do not exist'
      });
    }
    
    // Create the conversation using the service
    const conversation = await messageService.createConversation(
      { topic, participantIds, orderId },
      req.user.id,
      req.user.role
    );
    
    return res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      conversation
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create conversation',
      error: error.message
    });
  }
};

/**
 * Get all conversations for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getConversations = async (req, res) => {
  try {
    const conversations = await messageService.getUserConversations(req.user.id);
    
    return res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get conversations',
      error: error.message
    });
  }
};

/**
 * Get a specific conversation by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if conversation exists
    const conversation = await messageService.getConversationById(id);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Check if user is a participant
    const isParticipant = await messageService.isConversationParticipant(id, req.user.id);
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this conversation'
      });
    }
    
    return res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get conversation',
      error: error.message
    });
  }
};

/**
 * Get conversation related to a specific order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getConversationByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Check if user is authorized to access the order
    try {
      const isAuthorized = await messageService.isAuthorizedForOrderConversation(
        orderId,
        req.user.id,
        req.user.role
      );
      
      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to access conversations for this order'
        });
      }
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    // Find the conversation for this order
    const conversation = await messageService.getConversationByOrderId(orderId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'No conversation found for this order'
      });
    }
    
    return res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Error getting conversation by order ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get conversation',
      error: error.message
    });
  }
};

/**
 * Send a new message in a conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, attachments } = req.body;
    
    // Validate required fields
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    
    // Check if conversation exists
    const conversation = await messageService.getConversationById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Check if user is a participant
    const isParticipant = await messageService.isConversationParticipant(
      conversationId,
      req.user.id
    );
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to send messages in this conversation'
      });
    }
    
    // Send the message using the service
    const message = await messageService.sendMessage(
      { conversationId, content, attachments },
      req.user.id
    );
    
    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

/**
 * Get all messages in a conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // Check if conversation exists
    const conversation = await messageService.getConversationById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Check if user is a participant
    const isParticipant = await messageService.isConversationParticipant(
      conversationId,
      req.user.id
    );
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view messages in this conversation'
      });
    }
    
    // Get messages using the service
    const result = await messageService.getMessages(
      conversationId,
      page,
      limit,
      req.user.id
    );
    
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message
    });
  }
};

/**
 * Mark a message as read
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    try {
      await messageService.markMessageAsRead(messageId, req.user.id);
      
      return res.status(200).json({
        success: true,
        message: 'Message marked as read'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  } catch (error) {
    console.error('Error marking message as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
};

/**
 * Delete a message (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    try {
      await messageService.deleteMessage(messageId, req.user.id);
      
      return res.status(200).json({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

module.exports = {
  createConversation,
  getConversations,
  getConversationById,
  getConversationByOrderId,
  sendMessage,
  getMessages,
  markMessageAsRead,
  deleteMessage
};
