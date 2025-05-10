'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Buyers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      businessType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      businessName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      languagePreference: {
        type: Sequelize.STRING,
        defaultValue: 'English'
      },
      bookingNotification: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      emailNotification: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      smsNotification: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      orderUpdates: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      newProductNotification: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      promotionsOffers: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cityId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Cities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Buyers');
  }
};
