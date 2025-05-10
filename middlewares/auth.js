const jwt = require("jsonwebtoken");

/**
 * Middleware to verify JWT token
 * Checks for token in cookies or Authorization header
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token = 
      req.cookies?.token || 
      req.header('Authorization')?.replace('Bearer ', '');
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: "Not authenticated!" });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        return res.status(403).json({ message: "Token is not valid!" });
      }
      
      // Add user ID to request object
      req.userId = payload.id;
      req.userRole = payload.role;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { verifyToken };