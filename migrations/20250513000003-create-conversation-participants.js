'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ConversationParticipants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      conversationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Conversations',
          key: 'conversationId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('buyer', 'producer'),
        allowNull: false
      },
      lastReadMessageId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Messages',
          key: 'messageId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      joinedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ConversationParticipants');
  }
};
