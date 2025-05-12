'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add shippingAddressId column to Buyers table
    await queryInterface.addColumn('Buyers', 'shippingAddressId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Making it nullable initially to avoid issues with existing records
      references: {
        model: 'ShippingAddresses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove shippingAddressId column from Buyers table
    await queryInterface.removeColumn('Buyers', 'shippingAddressId');
  }
};
