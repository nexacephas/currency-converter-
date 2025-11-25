const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const CircuitBreaker = require('opossum');
const { logger } = require('../lib/logger');

// Configure axios-retry for all requests
axiosRetry(axios, { 
  retries: 3, 
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           (error.response && error.response.status >= 500);
  }
});

class FrankfurterProvider {
  constructor() {
    // Circuit breaker options
    const breakerOptions = {
      timeout: 10000,           // 10 second timeout
      errorThresholdPercentage: 50,  // Fail if 50% of requests fail
      resetTimeout: 30000,      // Reset attempt after 30 seconds
      name: 'FrankfurterCircuitBreaker'
    };

    // Wrap each method with circuit breaker
    this.breaker = {
      latest: new CircuitBreaker(
        (base) => this._getLatestRates(base), 
        breakerOptions
      ),
      convert: new CircuitBreaker(
        (amount, from, to) => this._convertCurrency(amount, from, to),
        breakerOptions
      ),
      history: new CircuitBreaker(
        (from, to, startDate, endDate) => this._getHistoricalRates(from, to, startDate, endDate),
        breakerOptions
      )
    };

    // Log circuit breaker events
    this.breaker.latest.on('open', () => logger.warn('Circuit breaker OPEN: getLatestRates'));
    this.breaker.convert.on('open', () => logger.warn('Circuit breaker OPEN: convertCurrency'));
    this.breaker.history.on('open', () => logger.warn('Circuit breaker OPEN: getHistoricalRates'));
  }

  // Private methods (actual API calls)
  async _getLatestRates(base = 'USD') {
    const res = await axios.get(`https://api.frankfurter.app/latest?from=${base}`);
    return res.data;
  }

  async _convertCurrency(amount, from, to) {
    const res = await axios.get(
      `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`
    );
    return res.data;
  }

  async _getHistoricalRates(from, to, startDate, endDate) {
    const res = await axios.get(
      `https://api.frankfurter.app/${startDate}..${endDate}?from=${from}&to=${to}`
    );
    return res.data;
  }

  // Public methods (circuit breaker wrapped)
  async getLatestRates(base = 'USD') {
    try {
      return await this.breaker.latest.fire(base);
    } catch (err) {
      logger.error(`getLatestRates failed: ${err.message}`);
      throw err;
    }
  }

  async convertCurrency(amount, from, to) {
    try {
      return await this.breaker.convert.fire(amount, from, to);
    } catch (err) {
      logger.error(`convertCurrency failed: ${err.message}`);
      throw err;
    }
  }

  async getHistoricalRates(from, to, startDate, endDate) {
    try {
      return await this.breaker.history.fire(from, to, startDate, endDate);
    } catch (err) {
      logger.error(`getHistoricalRates failed: ${err.message}`);
      throw err;
    }
  }

  // Backwards-compatible aliases
  async fetchLatest(base) {
    return this.getLatestRates(base);
  }

  async convert(amount, from, to) {
    return this.convertCurrency(amount, from, to);
  }

  async fetchHistory(from, to, startDate, endDate) {
    return this.getHistoricalRates(from, to, startDate, endDate);
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus() {
    return {
      latest: {
        state: this.breaker.latest.fallback ? 'open' : this.breaker.latest.closed ? 'closed' : 'half-open',
        stats: this.breaker.latest.stats
      },
      convert: {
        state: this.breaker.convert.fallback ? 'open' : this.breaker.convert.closed ? 'closed' : 'half-open',
        stats: this.breaker.convert.stats
      },
      history: {
        state: this.breaker.history.fallback ? 'open' : this.breaker.history.closed ? 'closed' : 'half-open',
        stats: this.breaker.history.stats
      }
    };
  }
}

module.exports = FrankfurterProvider;
