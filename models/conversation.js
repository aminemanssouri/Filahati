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
    timestamps: true
  });
  return Conversation;
};
