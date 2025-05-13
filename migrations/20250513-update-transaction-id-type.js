'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, create a temporary column to hold the existing externalTransactionId values
    await queryInterface.addColumn('Transactions', 'tempTransactionId', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Copy externalTransactionId values to tempTransactionId
    await queryInterface.sequelize.query(`
      UPDATE "Transactions" 
      SET "tempTransactionId" = "externalTransactionId" 
      WHERE "externalTransactionId" IS NOT NULL
    `);

    // Generate random string IDs for any transactions without externalTransactionId
    await queryInterface.sequelize.query(`
      UPDATE "Transactions" 
      SET "tempTransactionId" = 'TXN_' || EXTRACT(EPOCH FROM "transactionDate")::text || '_' || floor(random() * 1000000)::text
      WHERE "tempTransactionId" IS NULL
    `);

    // Drop the primary key constraint
    await queryInterface.removeConstraint('Transactions', 'Transactions_pkey');

    // Change transactionId type from UUID to STRING
    await queryInterface.changeColumn('Transactions', 'transactionId', {
      type: Sequelize.STRING,
      allowNull: false
    });

    // Update transactionId with values from tempTransactionId
    await queryInterface.sequelize.query(`
      UPDATE "Transactions" 
      SET "transactionId" = "tempTransactionId"
    `);

    // Add back the primary key constraint
    await queryInterface.addConstraint('Transactions', {
      fields: ['transactionId'],
      type: 'primary key',
      name: 'Transactions_pkey'
    });

    // Remove the temporary column
    await queryInterface.removeColumn('Transactions', 'tempTransactionId');

    // Remove the externalTransactionId column
    await queryInterface.removeColumn('Transactions', 'externalTransactionId');
  },

  async down(queryInterface, Sequelize) {
    // Add externalTransactionId column back
    await queryInterface.addColumn('Transactions', 'externalTransactionId', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Copy current transactionId values to externalTransactionId
    await queryInterface.sequelize.query(`
      UPDATE "Transactions" 
      SET "externalTransactionId" = "transactionId"
    `);

    // Drop the primary key constraint
    await queryInterface.removeConstraint('Transactions', 'Transactions_pkey');

    // Change transactionId back to UUID
    await queryInterface.changeColumn('Transactions', 'transactionId', {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false
    });

    // Generate new UUIDs for transactionId
    await queryInterface.sequelize.query(`
      UPDATE "Transactions" 
      SET "transactionId" = uuid_generate_v4()
    `);

    // Add back the primary key constraint
    await queryInterface.addConstraint('Transactions', {
      fields: ['transactionId'],
      type: 'primary key',
      name: 'Transactions_pkey'
    });
  }
};
