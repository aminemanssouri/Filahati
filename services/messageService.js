const { 
  Conversation, 
  ConversationParticipant, 
  Message, 
  User, 
  Order,
  Buyer,
  Producer
} = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a new conversation
 * @param {Object} conversationData - Conversation data
 * @param {number} userId - ID of the user creating the conversation
 * @param {string} userRole - Role of the user creating the conversation
 * @returns {Promise<Object>} Created conversation
 */
const createConversation = async (conversationData, userId, userRole) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { topic, participantIds, orderId } = conversationData;
    
    // Create the conversation
    const conversation = await Conversation.create({
      topic,
      startedBy: userId,
      orderId: orderId || null,
      lastMessageAt: new Date()
    }, { transaction });
    
    // Add the creator as a participant
    await ConversationParticipant.create({
      conversationId: conversation.conversationId,
      userId: userId,
      role: userRole,
      joinedAt: new Date()
    }, { transaction });
    
    // Add other participants
    for (const participantId of participantIds) {
      if (participantId !== userId) {
        // Get user role
        const user = await User.findByPk(participantId);
        
        await ConversationParticipant.create({
          conversationId: conversation.conversationId,
          userId: participantId,
          role: user.role,
          joinedAt: new Date()
        }, { transaction });
      }
    }
    
    await transaction.commit();
    
    // Get the complete conversation with participants
    return await getConversationById(conversation.conversationId);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Get a conversation by ID
 * @param {number} conversationId - Conversation ID
 * @returns {Promise<Object>} Conversation data
 */
const getConversationById = async (conversationId) => {
  return await Conversation.findByPk(conversationId, {
    include: [
      {
        model: ConversationParticipant,
        as: 'participants',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role']
          }
        ]
      },
      {
        model: User,
        as: 'initiator',
        attributes: ['id', 'firstName', 'lastName', 'email', 'role']
      },
      {
        model: Order,
        as: 'relatedOrder',
        attributes: ['orderId', 'orderDate', 'status']
      }
    ]
  });
};

/**
 * Get all conversations for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} List of conversations
 */
const getUserConversations = async (userId) => {
  // Find all conversations where the user is a participant
  const participations = await ConversationParticipant.findAll({
    where: { userId }
  });
  
  const conversationIds = participations.map(p => p.conversationId);
  
  // Get the conversations with their participants
  const conversations = await Conversation.findAll({
    where: { conversationId: { [Op.in]: conversationIds } },
    include: [
      {
        model: ConversationParticipant,
        as: 'participants',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role']
          }
        ]
      },
      {
        model: User,
        as: 'initiator',
        attributes: ['id', 'firstName', 'lastName', 'email', 'role']
      },
      {
        model: Order,
        as: 'relatedOrder',
        attributes: ['orderId', 'orderDate', 'status']
      }
    ],
    order: [['lastMessageAt', 'DESC']]
  });
  
  // For each conversation, get the last message and unread count
  return await Promise.all(
    conversations.map(async (conversation) => {
      const lastMessage = await Message.findOne({
        where: { conversationId: conversation.conversationId },
        order: [['sentAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName']
          }
        ]
      });
      
      // Get unread messages count for the user
      const participant = await ConversationParticipant.findOne({
        where: {
          conversationId: conversation.conversationId,
          userId
        }
      });
      
      let unreadCount = 0;
      if (participant) {
        unreadCount = await Message.count({
          where: {
            conversationId: conversation.conversationId,
            senderId: { [Op.ne]: userId },
            messageId: participant.lastReadMessageId 
              ? { [Op.gt]: participant.lastReadMessageId }
              : { [Op.gt]: 0 },
            isDeleted: false
          }
        });
      }
      
      return {
        ...conversation.toJSON(),
        lastMessage: lastMessage ? {
          messageId: lastMessage.messageId,
          content: lastMessage.content,
          sentAt: lastMessage.sentAt,
          sender: lastMessage.sender
        } : null,
        unreadCount
      };
    })
  );
};

/**
 * Get conversation by order ID
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Conversation data
 */
const getConversationByOrderId = async (orderId) => {
  return await Conversation.findOne({
    where: { orderId },
    include: [
      {
        model: ConversationParticipant,
        as: 'participants',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role']
          }
        ]
      },
      {
        model: User,
        as: 'initiator',
        attributes: ['id', 'firstName', 'lastName', 'email', 'role']
      }
    ]
  });
};

/**
 * Send a message in a conversation
 * @param {Object} messageData - Message data
 * @param {number} userId - ID of the user sending the message
 * @returns {Promise<Object>} Created message
 */
const sendMessage = async (messageData, userId) => {
  const { conversationId, content, attachments } = messageData;
  
  // Create the message
  const message = await Message.create({
    conversationId,
    senderId: userId,
    content,
    attachments: attachments || null,
    sentAt: new Date()
  });
  
  // Update conversation's lastMessageAt
  await Conversation.update(
    { lastMessageAt: new Date() },
    { where: { conversationId } }
  );
  
  // Get sender details
  const sender = await User.findByPk(userId, {
    attributes: ['id', 'firstName', 'lastName', 'email', 'role']
  });
  
  return {
    messageId: message.messageId,
    conversationId: message.conversationId,
    content: message.content,
    attachments: message.attachments,
    sentAt: message.sentAt,
    sender
  };
};

/**
 * Get messages in a conversation with pagination
 * @param {number} conversationId - Conversation ID
 * @param {number} page - Page number
 * @param {number} limit - Number of messages per page
 * @param {number} userId - User ID for updating read status
 * @returns {Promise<Object>} Paginated messages
 */
const getMessages = async (conversationId, page = 1, limit = 20, userId) => {
  // Calculate pagination
  const offset = (page - 1) * limit;
  
  // Get messages with pagination
  const { count, rows: messages } = await Message.findAndCountAll({
    where: {
      conversationId,
      isDeleted: false
    },
    include: [
      {
        model: User,
        as: 'sender',
        attributes: ['id', 'firstName', 'lastName', 'email', 'role']
      }
    ],
    order: [['sentAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
  
  // Update last read message for the user
  if (messages.length > 0) {
    const latestMessageId = messages[0].messageId;
    await ConversationParticipant.update(
      { lastReadMessageId: latestMessageId },
      {
        where: {
          conversationId,
          userId
        }
      }
    );
    
    // Mark messages as read if they weren't sent by the current user
    await Message.update(
      { readAt: new Date() },
      {
        where: {
          conversationId,
          senderId: { [Op.ne]: userId },
          readAt: null
        }
      }
    );
  }
  
  return {
    totalMessages: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    messages
  };
};

/**
 * Mark a message as read
 * @param {number} messageId - Message ID
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
const markMessageAsRead = async (messageId, userId) => {
  // Get the message
  const message = await Message.findByPk(messageId);
  if (!message) {
    throw new Error('Message not found');
  }
  
  // Don't mark your own messages as read
  if (message.senderId === userId) {
    throw new Error('You cannot mark your own messages as read');
  }
  
  // Update the message
  await Message.update(
    { readAt: new Date() },
    { where: { messageId } }
  );
  
  // Update the participant's last read message
  await ConversationParticipant.update(
    { lastReadMessageId: messageId },
    {
      where: {
        conversationId: message.conversationId,
        userId
      }
    }
  );
  
  return true;
};

/**
 * Delete a message (soft delete)
 * @param {number} messageId - Message ID
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
const deleteMessage = async (messageId, userId) => {
  // Get the message
  const message = await Message.findByPk(messageId);
  if (!message) {
    throw new Error('Message not found');
  }
  
  // Check if user is the sender of the message
  if (message.senderId !== userId) {
    throw new Error('You can only delete your own messages');
  }
  
  // Soft delete the message
  await Message.update(
    { isDeleted: true },
    { where: { messageId } }
  );
  
  return true;
};

/**
 * Check if user is a participant in a conversation
 * @param {number} conversationId - Conversation ID
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} Whether user is a participant
 */
const isConversationParticipant = async (conversationId, userId) => {
  const participant = await ConversationParticipant.findOne({
    where: {
      conversationId,
      userId
    }
  });
  
  return !!participant;
};

/**
 * Check if user is authorized to access an order's conversation
 * @param {number} orderId - Order ID
 * @param {number} userId - User ID
 * @param {string} userRole - User role
 * @returns {Promise<boolean>} Whether user is authorized
 */
const isAuthorizedForOrderConversation = async (orderId, userId, userRole) => {
  // Check if order exists
  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new Error('Order not found');
  }
  
  // For buyers, they should be the owner of the order
  // For producers, they should have products in the order
  let isAuthorized = false;
  
  if (userRole === 'buyer') {
    const buyer = await Buyer.findOne({ where: { userId } });
    isAuthorized = order.buyerId === buyer.id;
  } else if (userRole === 'producer') {
    const producer = await Producer.findOne({ where: { userId } });
    // In a real implementation, check if any order items have products from this producer
    // This is a simplified example
    isAuthorized = true; // Simplified for now
  }
  
  return isAuthorized;
};

module.exports = {
  createConversation,
  getConversationById,
  getUserConversations,
  getConversationByOrderId,
  sendMessage,
  getMessages,
  markMessageAsRead,
  deleteMessage,
  isConversationParticipant,
  isAuthorizedForOrderConversation
};
