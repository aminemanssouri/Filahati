'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ShippingAddress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define associations
      ShippingAddress.hasMany(models.Order, { foreignKey: 'shippingAddressId' });
      ShippingAddress.belongsTo(models.Buyer, { foreignKey: 'buyerId' });
      ShippingAddress.belongsTo(models.City, { foreignKey: 'cityId' });
      // Removing the circular reference - a Buyer can have many ShippingAddresses
      // and a ShippingAddress can be set as default (referenced by shippingAddressId in Buyer)
    }
  }
  ShippingAddress.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    addressLine1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    addressLine2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contactName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Cities',
        key: 'id'
      }
    },
    buyerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Buyers',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'ShippingAddress',
    tableName: 'ShippingAddresses'
  });
  return ShippingAddress;
};
