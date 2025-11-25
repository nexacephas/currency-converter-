const FrankfurterProvider = require("../providers/frankfurterProvider");
const redisClient = require("../lib/redisClient");

class HistoricalService {
  constructor() {
    this.provider = new FrankfurterProvider();
    this.ttl = 3600; // 1 hour cache
  }

  async getHistoricalRates(base, start_date, end_date, page = 1, limit = 20) {
    if (!base || !start_date || !end_date) throw new Error("Missing query parameters");

    const cacheKey = `history:${base}:${start_date}:${end_date}:${page}:${limit}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const data = await this.provider.getHistoricalRates(base, start_date, end_date, page, limit);

    await redisClient.setEx(cacheKey, this.ttl, JSON.stringify(data));
    return data;
  }
}

module.exports = HistoricalService;
