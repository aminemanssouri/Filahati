'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Cart belongs to a Buyer
      Cart.belongsTo(models.Buyer, { foreignKey: 'buyerId' });
      
      // Cart has many CartItems
      Cart.hasMany(models.CartItem, { foreignKey: 'cartId', onDelete: 'CASCADE' });
    }
  }
  Cart.init({
    buyerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Buyers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'Cart',
  });
  return Cart;
};