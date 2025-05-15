const NodeCache = require('node-cache');

// Create a cache instance with default TTL of 10 minutes and check period of 120 seconds
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if not found
 */
const getFromCache = (key) => {
  return cache.get(key);
};

/**
 * Set data in cache
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in seconds (optional)
 * @returns {boolean} - Success status
 */
const setToCache = (key, data, ttl = undefined) => {
  return cache.set(key, data, ttl);
};

/**
 * Delete data from cache
 * @param {string} key - Cache key
 * @returns {number} - Number of deleted entries
 */
const deleteFromCache = (key) => {
  return cache.del(key);
};

/**
 * Flush entire cache
 * @returns {void}
 */
const flushCache = () => {
  return cache.flushAll();
};

/**
 * Get cache stats
 * @returns {object} - Cache statistics
 */
const getCacheStats = () => {
  return cache.getStats();
};

module.exports = {
  getFromCache,
  setToCache,
  deleteFromCache,
  flushCache,
  getCacheStats
};
