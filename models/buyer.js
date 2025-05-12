'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Buyer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define assoc      // Associate with User model if needed
      Buyer.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  Buyer.init({
    businessType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    languagePreference: {
      type: DataTypes.STRING,
      defaultValue: 'English'
    },
    bookingNotification: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    emailNotification: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    smsNotification: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    orderUpdates: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    newProductNotification: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    promotionsOffers: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    shippingAddressId:{
      type: DataTypes.INTEGER,
      allowNull: true, // Making it nullable to match the migration
      references: {
        model: 'ShippingAddresses', // Corrected table name
        key: 'id'
      }
    },
    cityId :{
        type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Cities', 
        key: 'id'
      }
    }

  }, {
    sequelize,
    modelName: 'Buyer',
  });
  return Buyer;
};