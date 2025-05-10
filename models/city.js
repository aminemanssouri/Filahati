'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class City extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // A city belongs to a region
      City.belongsTo(models.Region, { foreignKey: 'regionId' });
      
      // A city can have many buyers and producers
      City.hasMany(models.Buyer, { foreignKey: 'cityId' });
      City.hasMany(models.Producer, { foreignKey: 'cityId' });
    }
  }
  City.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cityName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    regionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Regions',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'City',
  });
  return City;
};
