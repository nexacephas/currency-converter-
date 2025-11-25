const { getRedisClient } = require('../lib/redisClient');
const { logger } = require('../lib/logger');

class CacheService {
  constructor() {
    this.client = null;
  }

  async initialize() {
    try {
      this.client = getRedisClient();
    } catch (err) {
      logger.warn('Cache service initialized without Redis client');
    }
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async get(key) {
    try {
      if (!this.client) return null;
      const cached = await this.client.get(key);
      if (cached) {
        logger.debug(`Cache HIT: ${key}`);
        return JSON.parse(cached);
      }
      logger.debug(`Cache MISS: ${key}`);
      return null;
    } catch (err) {
      logger.warn(`Cache get error for key ${key}:`, err.message);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 3600)
   */
  async set(key, value, ttl = 3600) {
    try {
      if (!this.client) return;
      await this.client.setEx(key, ttl, JSON.stringify(value));
      logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
    } catch (err) {
      logger.warn(`Cache set error for key ${key}:`, err.message);
    }
  }

  /**
   * Delete cache key
   * @param {string} key - Cache key
   */
  async delete(key) {
    try {
      if (!this.client) return;
      await this.client.del(key);
      logger.debug(`Cache DELETE: ${key}`);
    } catch (err) {
      logger.warn(`Cache delete error for key ${key}:`, err.message);
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    try {
      if (!this.client) return;
      await this.client.flushDb();
      logger.info('Cache cleared');
    } catch (err) {
      logger.warn('Cache clear error:', err.message);
    }
  }

  /**
   * Generate cache key for latest rates
   * @param {string} base - Base currency
   * @returns {string} Cache key
   */
  getLatestRatesCacheKey(base) {
    return `rates:latest:${base.toUpperCase()}`;
  }

  /**
   * Generate cache key for historical rates
   * @param {string} base - Base currency
   * @param {string} start - Start date
   * @param {string} end - End date
   * @returns {string} Cache key
   */
  getHistoricalRatesCacheKey(base, start, end) {
    return `rates:history:${base.toUpperCase()}:${start}:${end}`;
  }

  /**
   * Generate cache key for conversion
   * @param {string} from - From currency
   * @param {string} to - To currency
   * @param {number} amount - Amount
   * @returns {string} Cache key
   */
  getConversionCacheKey(from, to, amount) {
    return `conversion:${from.toUpperCase()}:${to.toUpperCase()}:${amount}`;
  }
}

module.exports = CacheService;
