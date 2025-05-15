/**
 * Middleware to set HTTP cache headers for browser caching
 * @param {number} maxAge - Cache duration in seconds 
 * @returns {function} - Express middleware function
 */
const setCacheHeaders = (maxAge = 3600) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      next();
      return;
    }

    // Don't cache authenticated routes
    if (req.user) {
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      next();
      return;
    }

    // Set cache headers for public routes
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    res.setHeader('Expires', new Date(Date.now() + maxAge * 1000).toUTCString());
    
    next();
  };
};

module.exports = setCacheHeaders;
