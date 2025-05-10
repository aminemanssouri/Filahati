'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Images', 'productId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Products',
        key: 'ProductsId'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Images', 'productId');
  }
};
