const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const {connectDB} = require('./config/database');
const cookies = require('cookie-parser');
const http = require('http');
const logger = require('./services/loggerService');
// Import Socket.io authentication middleware
const socketAuth = require('./middlewares/socketAuth');
// Import routes
const apiRoutes = require('./routes/api');
// Import Socket.io event handlers
const { initializeSocketHandlers } = require('./socket/socketHandlers');
// Import clustered Socket.io implementation
const { initializeClusteredSocketIo } = require('./socket/socketCluster');
// Import error handling middleware
const errorHandler = require('./middlewares/errorHandler');
// Import cache headers middleware
const setCacheHeaders = require('./middlewares/cacheHeaders');
// Import cluster module to detect if we're in a worker
const cluster = require('cluster');




// Load environment variables
dotenv.config();

// Connect to database
connectDB().catch((err) => {
  logger.error('Database connection error:', { error: err.message, stack: err.stack });
});

// Initialize express app
const app = express();

// Handle port assignment in cluster mode
const getPort = () => {
  // If running in PM2, use the PORT environment variable
  if (process.env.PM2_PROCESS_NAME) {
    return process.env.PORT || 5000;
  }
  
  // If running in cluster mode, use worker id to calculate port
  // Primary stays on default port, workers use incremental ports
  if (cluster.isWorker) {
    const workerId = parseInt(process.env.WORKER_ID || cluster.worker.id);
    return (process.env.PORT || 5000) + workerId;
  }
  
  // Default port for non-clustered mode
  return process.env.PORT || 5000;
};

const PORT = getPort();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with clustering support
const io = initializeClusteredSocketIo(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: logger.stream }));
app.use(cookies());
// Apply cache headers middleware for all routes - with a default max age of 1 hour
app.use(setCacheHeaders(3600));
app.use('/api', apiRoutes);

// Apply error handling middleware
app.use(errorHandler);

// Only start the server if we're in a worker process or not running in cluster mode
if (!cluster.isPrimary || process.env.NODE_ENV === 'test' || process.env.PM2_PROCESS_NAME) {
  // Start server
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} with PID: ${process.pid}`);
    logger.info(`WebSocket server is running`);
  });
}

// Handle termination gracefully
process.on('SIGTERM', () => {
  logger.info(`Process ${process.pid} received SIGTERM - graceful shutdown`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 5 seconds if server hasn't closed
  setTimeout(() => {
    logger.warn('Forcing shutdown after timeout');
    process.exit(1);
  }, 5000);
});

module.exports = { app, server, io };
