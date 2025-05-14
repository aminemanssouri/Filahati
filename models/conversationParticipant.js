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
    timestamps: true
  });
  return ConversationParticipant;
};
