'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add index for Orders by buyerId
    // This will speed up retrieving orders for a buyer
    await queryInterface.addIndex('Orders', ['buyerId'], {
      name: 'orders_buyer_idx',
      using: 'BTREE'
    });

    // Add index for Orders by status
    // This will improve filtering orders by status
    await queryInterface.addIndex('Orders', ['status'], {
      name: 'orders_status_idx',
      using: 'BTREE'
    });

    // Add index for Orders by createdAt
    // This will optimize sorting by order date
    await queryInterface.addIndex('Orders', ['createdAt'], {
      name: 'orders_created_at_idx',
      using: 'BTREE'
    });

    // Add index for OrderItems by orderId
    // This will speed up retrieving items for an order
    await queryInterface.addIndex('OrderItems', ['orderId'], {
      name: 'order_items_order_idx',
      using: 'BTREE'
    });

    // Add index for OrderItems by productId
    // This will speed up finding all orders containing a specific product
    await queryInterface.addIndex('OrderItems', ['productId'], {
      name: 'order_items_product_idx',
      using: 'BTREE'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('Orders', 'orders_buyer_idx');
    await queryInterface.removeIndex('Orders', 'orders_status_idx');
    await queryInterface.removeIndex('Orders', 'orders_created_at_idx');
    await queryInterface.removeIndex('OrderItems', 'order_items_order_idx');
    await queryInterface.removeIndex('OrderItems', 'order_items_product_idx');
  }
};
