'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define associations
      OrderItem.belongsTo(models.Order, { foreignKey: 'orderId' });
      OrderItem.belongsTo(models.Product, { foreignKey: 'productId' });
    }
  }
  OrderItem.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'orderId'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'ProductsId'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Price at time of purchase'
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    producerNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Special instructions from the producer'
    },
    buyerNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Special requests from the buyer'
    }
  }, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'OrderItems',
    indexes: [
      // Index for OrderItems by order - speeds up retrieving all items for an order
      { name: 'order_items_order_idx', fields: ['orderId'] },
      
      // Index for OrderItems by product - speeds up finding all orders containing a specific product
      { name: 'order_items_product_idx', fields: ['productId'] },
      
      // Composite index for efficient joins between orders and products
      { name: 'order_items_order_product_idx', fields: ['orderId', 'productId'] }
    ]
  });
  return OrderItem;
};
