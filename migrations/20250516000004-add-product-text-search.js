'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create a GIN index for full-text search on product title and description
    await queryInterface.sequelize.query(`
      CREATE INDEX products_text_search_idx ON "Products" USING GIN (
        to_tsvector('english', "title" || ' ' || COALESCE("description", ''))
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS products_text_search_idx;
    `);
  }
};
