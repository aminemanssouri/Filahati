'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // First create the ENUM type
    await queryInterface.sequelize.query(
      'CREATE TYPE "enum_Products_status" AS ENUM ("Active", "Low Stock", "Out of Stock");'
    ).catch(error => {
      // Type might already exist, which is fine
      console.log('ENUM type may already exist, continuing...');
    });

    // Then add the status column
    await queryInterface.addColumn('Products', 'status', {
      type: Sequelize.ENUM('Active', 'Low Stock', 'Out of Stock'),
      allowNull: false,
      defaultValue: 'Active',
      comment: 'Product availability status'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove the status column
    await queryInterface.removeColumn('Products', 'status');

    // Drop the ENUM type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Products_status";');
  }
};
