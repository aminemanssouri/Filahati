'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // First remove the foreign key constraint if it exists
    try {
      await queryInterface.removeConstraint('Products', 'products_image_fk');
    } catch (error) {
      console.log('Foreign key constraint may not exist, continuing...');
    }

    // Then remove the column
    await queryInterface.removeColumn('Products', 'imageId');
  },

  async down (queryInterface, Sequelize) {
    // Add the column back
    await queryInterface.addColumn('Products', 'imageId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Images',
        key: 'imageId'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add the foreign key constraint back
    await queryInterface.addConstraint('Products', {
      fields: ['imageId'],
      type: 'foreign key',
      name: 'products_image_fk',
      references: {
        table: 'Images',
        field: 'imageId'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  }
};
