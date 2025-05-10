'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      ProductsId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      minorderquntity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
      },
      Availablequantity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      GrowingInfo: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      shippingInfo: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      imageId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      reviewId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      cityId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      producerId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  }
};
