/**
 * Socket.io cluster adapter for Filahati
 * This enables WebSocket message sharing across worker processes
 */

const socketIo = require('socket.io');
const socketAuth = require('../middlewares/socketAuth');
const { initializeSocketHandlers } = require('./socketHandlers');
const cluster = require('cluster');
const process = require('process');

/**
 * Initialize Socket.io with clustering support
 * @param {Object} server - HTTP server instance
 * @returns {Object} - Configured Socket.io instance
 */
function initializeClusteredSocketIo(server) {
  // Create Socket.io server with same settings as in server.js
  const io = socketIo(server, {
    cors: {
      origin: '*', // In production, specify your frontend URL
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    transports: ['websocket', 'polling'],
  });

  // Apply Socket.io authentication middleware
  io.use(socketAuth);

  // Initialize Socket.io event handlers
  initializeSocketHandlers(io);

  // Set up inter-process communication for worker processes
  if (!cluster.isPrimary) {
    // Listen for messages from the primary process
    process.on('message', (message) => {
      // Handle different types of messages
      if (message.type === 'socket_broadcast') {
        // Broadcast message to all clients connected to this worker
        io.emit(message.event, message.data);
      } else if (message.type === 'socket_room') {
        // Send message to a specific room
        io.to(message.room).emit(message.event, message.data);
      }
    });
  }

  // Extend io to support cross-worker broadcasts
  const originalEmit = io.emit.bind(io);
  io.emit = function(event, data) {
    // Emit to clients connected to this worker
    originalEmit(event, data);
    
    // If this is a worker, send the event to primary for broadcast to other workers
    if (!cluster.isPrimary) {
      process.send({
        type: 'broadcast',
        payload: {
          type: 'socket_broadcast',
          event: event,
          data: data
        }
      });
    }
  };

  // Extend room emits to support cross-worker room broadcasts
  const originalRoomEmit = io.to;
  io.to = function(room) {
    const originalEmit = originalRoomEmit.call(io, room).emit;
    const newTo = originalRoomEmit.call(io, room);
    
    newTo.emit = function(event, data) {
      // Call original room emit
      originalEmit.call(this, event, data);
      
      // If this is a worker, send to primary for broadcast to other workers
      if (!cluster.isPrimary) {
        process.send({
          type: 'broadcast',
          payload: {
            type: 'socket_room',
            room: room,
            event: event,
            data: data
          }
        });
      }
    };
    
    return newTo;
  };

  return io;
}

module.exports = { initializeClusteredSocketIo };
