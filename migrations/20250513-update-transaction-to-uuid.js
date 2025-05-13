'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, we need to drop any foreign key constraints that reference the transactionId
    await queryInterface.removeConstraint(
      'Transactions',
      'Transactions_pkey'
    ).catch(err => {
      console.log('No primary key constraint to remove or different name:', err.message);
    });

    // Create a temporary column for the UUID
    await queryInterface.addColumn('Transactions', 'uuid_transactionId', {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    });

    // Copy data from existing transactions (if needed)
    await queryInterface.sequelize.query(`
      UPDATE "Transactions" 
      SET "uuid_transactionId" = gen_random_uuid()
    `);

    // Remove the old primary key column
    await queryInterface.removeColumn('Transactions', 'transactionId');

    // Rename the UUID column to be the primary key
    await queryInterface.renameColumn('Transactions', 'uuid_transactionId', 'transactionId');

    // Add primary key constraint to the new column
    await queryInterface.addConstraint('Transactions', {
      fields: ['transactionId'],
      type: 'primary key',
      name: 'Transactions_pkey'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert back to integer primary key
    // First, create a temporary integer column
    await queryInterface.addColumn('Transactions', 'int_transactionId', {
      type: Sequelize.INTEGER,
      autoIncrement: true
    });

    // Remove the UUID primary key constraint
    await queryInterface.removeConstraint(
      'Transactions',
      'Transactions_pkey'
    );

    // Remove the UUID column
    await queryInterface.removeColumn('Transactions', 'transactionId');

    // Rename the integer column to be the primary key
    await queryInterface.renameColumn('Transactions', 'int_transactionId', 'transactionId');

    // Add primary key constraint to the new column
    await queryInterface.addConstraint('Transactions', {
      fields: ['transactionId'],
      type: 'primary key',
      name: 'Transactions_pkey'
    });
  }
};
