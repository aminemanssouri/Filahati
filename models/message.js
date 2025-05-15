'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association
      Message.belongsTo(models.Conversation, {
        foreignKey: 'conversationId',
        as: 'conversation'
      });
      
      Message.belongsTo(models.User, {
        foreignKey: 'senderId',
        as: 'sender'
      });
    }
  }
  Message.init({
    messageId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Conversations',
        key: 'conversationId'
      }
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'Messages',
    timestamps: true,
    indexes: [
      // Index for retrieving messages by conversation
      { name: 'messages_conversation_idx', fields: ['conversationId'] },
      // Index for retrieving messages by sender
      { name: 'messages_sender_idx', fields: ['senderId'] },
      // Index for sorting by message time
      { name: 'messages_sent_at_idx', fields: ['sentAt'] },
      // Composite index for conversation + time - optimizes message history queries
      { name: 'messages_conv_time_idx', fields: ['conversationId', 'sentAt'] }
    ]
  });
  return Message;
};
