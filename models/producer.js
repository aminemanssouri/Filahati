'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Producer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Associate with User model
      Producer.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  Producer.init({
    businessName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    productionType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    streetAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Cities', // Assuming you have a Cities table
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Producer',
  });
  return Producer;
};
