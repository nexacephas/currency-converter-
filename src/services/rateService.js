const FrankfurterProvider = require('../providers/frankfurterProvider');
const CacheService = require('./cacheService');

class RateService {
  constructor() {
    this.provider = new FrankfurterProvider();
    this.cache = new CacheService();
  }

  async initialize() {
    await this.cache.initialize();
  }

  // Controller expects `getLatestRates(base)`
  async getLatestRates(base) {
    const cacheKey = this.cache.getLatestRatesCacheKey(base);
    
    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    
    const data = await this.provider.getLatestRates(base);
    const result = {
      base: data.base,
      date: data.date,
      rates: data.rates,
      details: data,
    };
    
    // Cache for 1 hour (3600 seconds)
    await this.cache.set(cacheKey, result, 3600);
    return result;
  }

  // Controller calls `convertCurrency(from, to, amount)` but provider expects (amount, from, to)
  async convertCurrency(from, to, amount) {
    const cacheKey = this.cache.getConversionCacheKey(from, to, amount);
    
    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    
    const data = await this.provider.convertCurrency(amount, from, to);
    const converted = data && data.rates ? data.rates[to] : null;
    const rate = converted && amount ? converted / amount : null;
    const result = {
      converted,
      rate,
      base: data ? data.base : from,
      to,
      date: data ? data.date : null,
      details: data,
    };
    
    // Cache for 1 hour
    await this.cache.set(cacheKey, result, 3600);
    return result;
  }

  // Align signature with controller: getHistoricalRates(base, start, end, page, limit)
  // Provider expects (from, to, startDate, endDate). We'll default `to` to 'USD'.
  async getHistoricalRates(base, start, end, page = 1, limit = 10) {
    const to = 'USD';
    const cacheKey = this.cache.getHistoricalRatesCacheKey(base, start, end);
    
    // Try cache first (entire result set, not paginated)
    const cached = await this.cache.get(cacheKey);
    let data = cached ? { rates: cached } : null;
    
    if (!data) {
      data = await this.provider.getHistoricalRates(base, to, start, end);
      // Cache the raw data for 24 hours
      if (data.rates) {
        await this.cache.set(cacheKey, data.rates, 86400);
      }
    }
    
    // Handle pagination locally
    let rates = data.rates || data;
    if (typeof rates === 'object' && !Array.isArray(rates)) {
      rates = Object.entries(rates).map(([date, dateRates]) => ({
        date,
        rates: dateRates
      }));
    }
    
    // Ensure rates is an array for pagination
    if (!Array.isArray(rates)) {
      rates = [];
    }
    
    // Calculate pagination
    const totalCount = rates.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRates = rates.slice(startIndex, endIndex);
    
    return {
      base,
      to,
      start_date: start,
      end_date: end,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      rates: paginatedRates,
      details: data,
    };
  }
}

module.exports = RateService;
