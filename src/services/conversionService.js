const RateService = require("./rateService");

// Blacklisted currencies
const EXCLUDED_CURRENCIES = ["TRY", "PLN", "THB", "MXN"];

class ConversionService {
  constructor() {
    this.rateService = new RateService();
  }

  async convert(from, to, amount) {
    if (!from || !to || !amount) throw new Error("Missing required fields");
    if (EXCLUDED_CURRENCIES.includes(from) || EXCLUDED_CURRENCIES.includes(to)) {
      throw new Error(`Conversion for ${from} or ${to} is not allowed`);
    }

    const rates = await this.rateService.getLatestRates();

    if (!rates[from] || !rates[to]) throw new Error("Currency not supported");

    const convertedAmount = (amount / rates[from]) * rates[to];
    return {
      from,
      to,
      amount,
      convertedAmount: parseFloat(convertedAmount.toFixed(4)),
    };
  }
}

module.exports = ConversionService;
