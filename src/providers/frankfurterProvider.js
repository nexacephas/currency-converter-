const axios = require('axios');

class FrankfurterProvider {
  // Align provider API with services: getLatestRates, convertCurrency, getHistoricalRates
  async getLatestRates(base = 'USD') {
    const res = await axios.get(`https://api.frankfurter.app/latest?from=${base}`);
    return res.data;
  }

  async convertCurrency(amount, from, to) {
    const res = await axios.get(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`);
    return res.data;
  }

  async getHistoricalRates(from, to, startDate, endDate) {
    const res = await axios.get(`https://api.frankfurter.app/${startDate}..${endDate}?from=${from}&to=${to}`);
    return res.data;
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
}

module.exports = FrankfurterProvider;
