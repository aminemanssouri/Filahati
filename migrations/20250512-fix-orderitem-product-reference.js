'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First remove the existing foreign key constraint
    await queryInterface.removeConstraint(
      'OrderItems',
      'OrderItems_productId_fkey' // This is the default Sequelize naming convention, adjust if needed
    ).catch(err => {
      console.log('No constraint to remove or different name:', err.message);
      // Continue even if constraint doesn't exist or has a different name
    });

    // Then update the reference to point to the correct column
    await queryInterface.changeColumn('OrderItems', 'productId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'ProductsId'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert back to the original reference
    await queryInterface.changeColumn('OrderItems', 'productId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'ProductsId'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  }
};
