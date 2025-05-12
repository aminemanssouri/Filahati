'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define associations
      Order.belongsTo(models.Buyer, { foreignKey: 'buyerId' });
      Order.belongsTo(models.ShippingAddress, { foreignKey: 'shippingAddressId' });
      // Direct relationship with OrderItem
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId' });
      // Many-to-many relationship with Product through OrderItem
      Order.belongsToMany(models.Product, { 
        through: models.OrderItem,
        foreignKey: 'orderId',
        otherKey: 'productId'
      });
    }
  }
  Order.init({
    orderId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    buyerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Buyers',
        key: 'id'
      }
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'),
      allowNull: false,
      defaultValue: 'Pending'
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false
    },
    paymentStatus: {
      type: DataTypes.ENUM('Pending', 'Completed', 'Failed', 'Refunded'),
      allowNull: false,
      defaultValue: 'Pending'
    },
    shippingAddressId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ShippingAddresses',
        key: 'id'
      }
    },
    shippingCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'Orders'
  });
  return Order;
};
