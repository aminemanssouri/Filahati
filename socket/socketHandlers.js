/**
 * Socket.io event handlers
 * Contains all the event handlers for Socket.io connections
 */
const { getFromCache, setToCache } = require('../services/cacheService');
const logger = require('../services/loggerService');

/**
 * Initialize Socket.io event handlers
 * @param {Object} io - Socket.io server instance
 */
const initializeSocketHandlers = (io) => {
  // Socket.io connection handling
  io.on('connection', (socket) => {
    logger.info(`User connected`, { userId: socket.user.id, socketId: socket.id });
    
    // Join user to their personal room for direct messages
    socket.join(`user:${socket.user.id}`);
    
    // Join conversation rooms
    socket.on('join-conversation', async (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      logger.info(`User joined conversation`, { userId: socket.user.id, conversationId });
    });
    
    // Leave conversation rooms
    socket.on('leave-conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      logger.info(`User left conversation`, { userId: socket.user.id, conversationId });
    });
    
    // Handle new messages
    socket.on('send-message', async (messageData) => {
      try {
        // Log the received data for debugging
        logger.debug('Received message data', { 
          messageData: JSON.stringify(messageData),
          userId: socket.user.id,
          socketId: socket.id
        });
        
        // Validate required fields
        if (!messageData || !messageData.conversationId || !messageData.content) {
          logger.error('Missing required message data', { 
            hasMessageData: !!messageData,
            conversationId: messageData?.conversationId,
            content: messageData?.content,
            userId: socket.user.id,
            socketId: socket.id,
            messageDataType: messageData ? typeof messageData : 'undefined',
            messageDataKeys: messageData ? Object.keys(messageData) : []            
          });
          return socket.emit('message-error', { error: 'Missing required fields: conversationId and content are required' });
        }
        
        const { Message, Conversation } = require('../models');
        
        // Check if conversation exists
        const conversation = await Conversation.findByPk(messageData.conversationId);
        if (!conversation) {
          logger.error(`Conversation not found`, { conversationId: messageData.conversationId, userId: socket.user.id });
          return socket.emit('message-error', { error: 'Conversation not found' });
        }
        
        // Create message in database
        const message = await Message.create({
          conversationId: messageData.conversationId,
          senderId: socket.user.id,
          content: messageData.content,
          attachments: messageData.attachments || [],
          sentAt: new Date()
        });
        
        logger.info('Message created successfully', { messageId: message.messageId, conversationId: message.conversationId, senderId: socket.user.id });
        
        // Update conversation's lastMessageAt
        await Conversation.update(
          { lastMessageAt: new Date() },
          { where: { conversationId: messageData.conversationId } }
        );
        
        // Emit message to all users in the conversation
        io.to(`conversation:${messageData.conversationId}`).emit('new-message', {
          messageId: message.messageId,
          conversationId: message.conversationId,
          senderId: message.senderId,
          senderName: socket.user.firstName + ' ' + socket.user.lastName,
          content: message.content,
          attachments: message.attachments,
          sentAt: message.sentAt
        });
        
      } catch (error) {
        logger.error('Error sending message', { 
          error: error.message, 
          stack: error.stack,
          userId: socket.user.id,
          messageData: messageData ? JSON.stringify(messageData) : null 
        });
        socket.emit('message-error', { error: 'Failed to send message' });
      }
    });
    
    // Handle message read status
    socket.on('mark-as-read', async (data) => {
      try {
        const { messageId, conversationId } = data;
        const { ConversationParticipant, Message } = require('../models');
        
        // Get the message to ensure it exists
        const message = await Message.findByPk(messageId);
        if (!message) {
          return socket.emit('read-status-error', { error: 'Message not found' });
        }
        
        // Update the participant's last read message
        await ConversationParticipant.update(
          { lastReadMessageId: messageId },
          { 
            where: { 
              conversationId,
              userId: socket.user.id
            } 
          }
        );
        
        // Update the message read status if it wasn't sent by the current user
        if (message.senderId !== socket.user.id) {
          await Message.update(
            { readAt: new Date() },
            { where: { messageId } }
          );
        }
        
        // Notify the sender that their message was read
        io.to(`user:${message.senderId}`).emit('message-read', {
          messageId,
          conversationId,
          readBy: socket.user.id,
          readAt: new Date()
        });
        
      } catch (error) {
        logger.error('Error marking message as read', { 
          error: error.message, 
          stack: error.stack,
          userId: socket.user.id,
          messageId: data?.messageId,
          conversationId: data?.conversationId
        });
        socket.emit('read-status-error', { error: 'Failed to update read status' });
      }
    });
    
    // Handle typing indicator
    socket.on('typing', (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('user-typing', {
        conversationId,
        userId: socket.user.id,
        userName: socket.user.firstName + ' ' + socket.user.lastName
      });
    });
    
    // Handle stop typing indicator
    socket.on('stop-typing', (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('user-stop-typing', {
        conversationId,
        userId: socket.user.id
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected`, { userId: socket.user.id, socketId: socket.id });
    });
  });
};

module.exports = { initializeSocketHandlers };
