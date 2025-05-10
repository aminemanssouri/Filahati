'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.Category, { foreignKey: 'categoryId' });
      Product.belongsTo(models.City, { foreignKey: 'cityId' });
      Product.belongsTo(models.Producer, { foreignKey: 'producerId' });
      Product.belongsTo(models.Unites, { foreignKey: 'uniteId' });
      Product.hasMany(models.Review, { foreignKey: 'productId' });
      Product.hasMany(models.Image, { foreignKey: 'productId' });
    }
  }
  Product.init({
    ProductsId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    minorderquntity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    Availablequantity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    HarvestDate:{
      type: DataTypes.DATE,
      allowNull:true
    },
    ExpiryDate:{
      type: DataTypes.DATE,
      allowNull:false
    },
    FreeShipping:{
      type: DataTypes.BOOLEAN,
      allowNull:false
    },
    uniteId:{
      type: DataTypes.INTEGER,
      allowNull:false,
      references: {
        model: 'Unites',
        key: 'id'
      }
    },
    GrowingInfo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    shippingInfo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Images',
        key: 'imageId'
      }
    },
    Organic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Categories',
        key: 'categoryId'
      }
    },
    reviewId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Reviews',
        key: 'reviewId'
      }
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Cities',
        key: 'id'
      }
    },
    producerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Producers',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'Products'
  });
  return Product;
};
