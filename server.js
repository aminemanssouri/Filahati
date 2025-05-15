const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const {connectDB} = require('./config/database');
const cookies = require('cookie-parser');
const http = require('http');
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
  console.log('Database connection error:', err);
});

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with clustering support
const io = initializeClusteredSocketIo(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookies());
// Apply cache headers middleware for all routes - with a default max age of 1 hour
app.use(setCacheHeaders(3600));
app.use('/api', apiRoutes);

// Apply error handling middleware
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with PID: ${process.pid}`);
  console.log(`WebSocket server is running`);
});

// Handle termination gracefully
process.on('SIGTERM', () => {
  console.log(`Process ${process.pid} received SIGTERM - graceful shutdown`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 5 seconds if server hasn't closed
  setTimeout(() => {
    console.log('Forcing shutdown after timeout');
    process.exit(1);
  }, 5000);
});

module.exports = { app, server, io };
