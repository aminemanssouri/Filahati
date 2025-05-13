const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const {connectDB} = require('./config/database');
const cookies = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');
// Import Socket.io authentication middleware
const socketAuth = require('./middlewares/socketAuth');
// Import routes
const apiRoutes = require('./routes/api');
// Import Socket.io event handlers
const { initializeSocketHandlers } = require('./socket/socketHandlers');
// Import error handling middleware
const errorHandler = require('./middlewares/errorHandler');




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

// Initialize Socket.io with CORS settings
const io = socketIo(server, {
  cors: {
    origin: '*', // In production, specify your frontend URL
    methods: ['GET', 'POST'],
    credentials: true
  },
  // Enable WebSocket transport
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookies());
app.use('/api', apiRoutes);

// Apply Socket.io authentication middleware
io.use(socketAuth);

// Initialize Socket.io event handlers
initializeSocketHandlers(io);

// Apply error handling middleware
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server is running`);
});

module.exports = { app, server, io };
