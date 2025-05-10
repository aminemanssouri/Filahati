'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add HarvestDate field
    await queryInterface.addColumn('Products', 'HarvestDate', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add ExpiryDate field
    await queryInterface.addColumn('Products', 'ExpiryDate', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    // Add FreeShipping field
    await queryInterface.addColumn('Products', 'FreeShipping', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    // Add uniteId field (foreign key to Unites table)
    await queryInterface.addColumn('Products', 'uniteId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Unites',
        key: 'id'
      }
    });

    // Add Organic field
    await queryInterface.addColumn('Products', 'Organic', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove the added columns
    await queryInterface.removeColumn('Products', 'HarvestDate');
    await queryInterface.removeColumn('Products', 'ExpiryDate');
    await queryInterface.removeColumn('Products', 'FreeShipping');
    await queryInterface.removeColumn('Products', 'uniteId');
    await queryInterface.removeColumn('Products', 'Organic');
  }
};
