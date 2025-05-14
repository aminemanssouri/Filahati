'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Messages', {
      messageId: {
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
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      attachments: {
        type: Sequelize.JSON,
        allowNull: true
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.dropTable('Messages');
  }
};
