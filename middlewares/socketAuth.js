const jwt = require('jsonwebtoken');

/**
 * Socket.io authentication middleware
 * Verifies the JWT token provided in the socket handshake
 * and attaches the decoded user to the socket object
 * 
 * @param {Object} socket - Socket.io socket object
 * @param {Function} next - Next function to call
 */
const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token;
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
