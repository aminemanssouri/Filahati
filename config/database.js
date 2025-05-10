const Sequelize = require('sequelize');
const config = require('./config');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create Sequelize instance with additional options
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: console.log, // Set to false to disable SQL logging
    pool: {
      max: 5,           // Maximum number of connection in pool
      min: 0,           // Minimum number of connection in pool
      acquire: 30000,   // Maximum time (ms) that pool will try to get connection before throwing error
      idle: 10000       // Maximum time (ms) that a connection can be idle before being released
    }
  }
);

// Connect to the database
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit with failure
  }
};

// Export both the connection function and the sequelize instance
module.exports = {
  connectDB,
  sequelize
};
