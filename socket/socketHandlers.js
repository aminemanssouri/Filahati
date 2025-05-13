/**
 * Socket.io event handlers
 * Contains all the event handlers for Socket.io connections
 */

/**
 * Initialize Socket.io event handlers
 * @param {Object} io - Socket.io server instance
 */
const initializeSocketHandlers = (io) => {
  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    
    // Join user to their personal room for direct messages
    socket.join(`user:${socket.user.id}`);
    
    // Join conversation rooms
    socket.on('join-conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${socket.user.id} joined conversation ${conversationId}`);
    });
    
    // Leave conversation rooms
    socket.on('leave-conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.user.id} left conversation ${conversationId}`);
    });
    
    // Handle new messages
    socket.on('send-message', async (messageData) => {
      try {
        const { Message, Conversation } = require('../models');
        
        // Create message in database
        const message = await Message.create({
          conversationId: messageData.conversationId,
          senderId: socket.user.id,
          content: messageData.content,
          attachments: messageData.attachments,
          sentAt: new Date()
        });
        
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
        console.error('Error sending message:', error);
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
        console.error('Error marking message as read:', error);
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
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });
};

module.exports = { initializeSocketHandlers };
