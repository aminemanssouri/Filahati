'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ConversationParticipant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association
      ConversationParticipant.belongsTo(models.Conversation, {
        foreignKey: 'conversationId',
        as: 'conversation'
      });
      
      ConversationParticipant.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  ConversationParticipant.init({
    id: {
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('buyer', 'producer'),
      allowNull: false
    },
    lastReadMessageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Messages',
        key: 'messageId'
      }
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'ConversationParticipant',
    tableName: 'ConversationParticipants',
    timestamps: true,
    indexes: [
      // Index for participants by user - speeds up finding all conversations a user is part of
      { name: 'conversation_participants_user_idx', fields: ['userId'] },
      
      // Index for participants by conversation - speeds up finding all participants in a conversation
      { name: 'conversation_participants_conversation_idx', fields: ['conversationId'] },
      
      // Index for participants by role - helps when finding all buyers or producers in conversations
      { name: 'conversation_participants_role_idx', fields: ['role'] },
      
      // Composite index for user in conversation - optimizes checking if a user is in a specific conversation
      { name: 'conversation_participants_user_conversation_idx', fields: ['userId', 'conversationId'] },
      
      // Index for lastReadMessageId - speeds up finding unread messages
      { name: 'conversation_participants_last_read_msg_idx', fields: ['lastReadMessageId'] }
    ]
  });
  return ConversationParticipant;
};
