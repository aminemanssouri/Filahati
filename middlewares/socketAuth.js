const jwt = require('jsonwebtoken');
const cookie = require('cookie');

/**
 * Socket.io authentication middleware
 * Verifies the JWT token provided in the cookies or auth object
 * and attaches the decoded user to the socket object
 * 
 * @param {Object} socket - Socket.io socket object
 * @param {Function} next - Next function to call
 */
const socketAuth = (socket, next) => {
  let token 
  // Try to get token from cookies first
  if (socket.handshake.headers.cookie) {
    token = socket.handshake.headers.cookie; // Using 'token' as the cookie name to match your auth system
  }
  
  // If no token in cookies, try to get it from auth object (fallback)
  if (!token && socket.handshake.auth && socket.handshake.auth.token) {
    token = socket.handshake.auth.token;
  }
  
  if (!token) {
    return next(new Error('Authentication error: Token not provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
};

module.exports = socketAuth;
