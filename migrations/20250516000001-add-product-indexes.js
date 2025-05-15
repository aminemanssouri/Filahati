'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add index to Product.title for text search
    await queryInterface.addIndex('Products', ['title'], {
      name: 'products_title_idx',
      using: 'BTREE'
    });

    // Add index to Product.price for range queries
    await queryInterface.addIndex('Products', ['price'], {
      name: 'products_price_idx',
      using: 'BTREE'
    });

    // Add index for Products by category
    await queryInterface.addIndex('Products', ['categoryId'], {
      name: 'products_category_idx',
      using: 'BTREE'
    });

    // Add composite index for Products by city and category 
    // (useful for filtering products by location and category)
    await queryInterface.addIndex('Products', ['cityId', 'categoryId'], {
      name: 'products_city_category_idx',
      using: 'BTREE'
    });

    // Add index for organic products (useful if you filter by this field)
    await queryInterface.addIndex('Products', ['Organic'], {
      name: 'products_organic_idx',
      using: 'BTREE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('Products', 'products_title_idx');
    await queryInterface.removeIndex('Products', 'products_price_idx');
    await queryInterface.removeIndex('Products', 'products_category_idx');
    await queryInterface.removeIndex('Products', 'products_city_category_idx');
    await queryInterface.removeIndex('Products', 'products_organic_idx');
  }
};
