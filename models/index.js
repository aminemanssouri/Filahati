'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// Load config from config.json as a template
const configTemplate = require(__dirname + '/../config/config.js')[env];

// Replace config values with environment variables if they exist
const config = {
  ...configTemplate,
  username: process.env.DB_USER || configTemplate.username,
  password: process.env.DB_PASSWORD || configTemplate.password,
  database: process.env.DB_DATABASE || configTemplate.database,
  host: process.env.DB_HOST || configTemplate.host,
  port: process.env.DB_PORT || configTemplate.port
};

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

console.log('Database connection established with:', {
  database: config.database,
  username: config.username,
  host: config.host,
  dialect: config.dialect
});

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
