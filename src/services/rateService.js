const FrankfurterProvider = require('../providers/frankfurterProvider');

class RateService {
  constructor() {
    this.provider = new FrankfurterProvider();
  }

  // Controller expects `getLatestRates(base)`
  async getLatestRates(base) {
    const data = await this.provider.getLatestRates(base);
    return {
      base: data.base,
      date: data.date,
      rates: data.rates,
      details: data,
    };
  }

  // Controller calls `convertCurrency(from, to, amount)` but provider expects (amount, from, to)
  async convertCurrency(from, to, amount) {
    const data = await this.provider.convertCurrency(amount, from, to);
    const converted = data && data.rates ? data.rates[to] : null;
    const rate = converted && amount ? converted / amount : null;
    return {
      converted,
      rate,
      base: data ? data.base : from,
      to,
      date: data ? data.date : null,
      details: data,
    };
  }

  // Align signature with controller: getHistoricalRates(base, start_date, end_date)
  // Provider expects (from, to, startDate, endDate). We'll default `to` to 'USD'.
  async getHistoricalRates(base, start_date, end_date) {
    const to = 'USD';
    const data = await this.provider.getHistoricalRates(base, to, start_date, end_date);
    return {
      base,
      to,
      start_date,
      end_date,
      rates: data.rates || data,
      details: data,
    };
  }
}

module.exports = RateService;
