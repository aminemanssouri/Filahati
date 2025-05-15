const { getFromCache, setToCache } = require('../services/cacheService');

/**
 * Middleware to cache API responses
 * @param {number} duration - Cache duration in seconds (default: 300 seconds / 5 minutes)
 * @returns {function} - Express middleware function
 */
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create a unique cache key based on the URL and any query parameters
    const cacheKey = `__express__${req.originalUrl || req.url}`;
    
    // Try to get cached response
    const cachedResponse = getFromCache(cacheKey);
    
    if (cachedResponse) {
      // Return cached response
      return res.send(cachedResponse);
    }

    // Store the original send function
    const originalSend = res.send;
    
    // Override the send function to cache the response before sending
    res.send = function(body) {
      // Cache the response
      setToCache(cacheKey, body, duration);
      
      // Call the original send function
      originalSend.call(this, body);
    };
    
    next();
  };
};

module.exports = cacheMiddleware;
