'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association
      Conversation.belongsTo(models.User, { 
        foreignKey: 'startedBy',
        as: 'initiator'
      });
      
      Conversation.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'relatedOrder',
        allowNull: true
      });
      
      Conversation.hasMany(models.Message, {
        foreignKey: 'conversationId',
        as: 'messages'
      });
      
      Conversation.hasMany(models.ConversationParticipant, {
        foreignKey: 'conversationId',
        as: 'participants'
      });
    }
  }
  Conversation.init({
    conversationId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Orders',
        key: 'orderId'
      }
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Conversation',
    tableName: 'Conversations',
    timestamps: true,
    indexes: [
      // Index for conversations by initiator - speeds up finding conversations started by a user
      { name: 'conversations_starter_idx', fields: ['startedBy'] },
      
      // Index for conversations by related order - optimizes order-related conversation lookup
      { name: 'conversations_order_idx', fields: ['orderId'] },
      
      // Index for sorting conversations by last message time
      { name: 'conversations_last_message_idx', fields: ['lastMessageAt'] },
      
      // Composite index for order conversations with timestamp - helps with sorting order messages
      { name: 'conversations_order_time_idx', fields: ['orderId', 'lastMessageAt'] }
    ]
  });
  return Conversation;
};
