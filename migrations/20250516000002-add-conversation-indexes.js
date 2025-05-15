'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add index for Messages by conversationId
    // This will speed up retrieving messages for a conversation
    await queryInterface.addIndex('Messages', ['conversationId'], {
      name: 'messages_conversation_idx',
      using: 'BTREE'
    });

    // Add index for Messages by senderId
    // This will speed up retrieving messages sent by a specific user
    await queryInterface.addIndex('Messages', ['senderId'], {
      name: 'messages_sender_idx',
      using: 'BTREE'
    });

    // Add index for Messages by sentAt
    // This will optimize sorting by message time
    await queryInterface.addIndex('Messages', ['sentAt'], {
      name: 'messages_sent_at_idx',
      using: 'BTREE'
    });

    // Add index for ConversationParticipants by userId
    // This will speed up finding all conversations a user is part of
    await queryInterface.addIndex('ConversationParticipants', ['userId'], {
      name: 'conversation_participants_user_idx',
      using: 'BTREE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('Messages', 'messages_conversation_idx');
    await queryInterface.removeIndex('Messages', 'messages_sender_idx');
    await queryInterface.removeIndex('Messages', 'messages_sent_at_idx');
    await queryInterface.removeIndex('ConversationParticipants', 'conversation_participants_user_idx');
  }
};
