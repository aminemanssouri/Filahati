'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add foreign key constraints to Products table
    await queryInterface.addConstraint('Products', {
      fields: ['categoryId'],
      type: 'foreign key',
      name: 'products_category_fk',
      references: {
        table: 'Categories',
        field: 'categoryId'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('Products', {
      fields: ['cityId'],
      type: 'foreign key',
      name: 'products_city_fk',
      references: {
        table: 'Cities',
        field: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('Products', {
      fields: ['producerId'],
      type: 'foreign key',
      name: 'products_producer_fk',
      references: {
        table: 'Producers',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Add foreign key constraints for Reviews and Images after they are created
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

    await queryInterface.addConstraint('Products', {
      fields: ['reviewId'],
      type: 'foreign key',
      name: 'products_review_fk',
      references: {
        table: 'Reviews',
        field: 'reviewId'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove all foreign key constraints
    await queryInterface.removeConstraint('Products', 'products_category_fk');
    await queryInterface.removeConstraint('Products', 'products_city_fk');
    await queryInterface.removeConstraint('Products', 'products_producer_fk');
    await queryInterface.removeConstraint('Products', 'products_image_fk');
    await queryInterface.removeConstraint('Products', 'products_review_fk');
  }
};
