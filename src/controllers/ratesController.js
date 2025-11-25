const RateService = require('../services/rateService');
const rateService = new RateService();

// Currencies excluded from conversion
const EXCLUDED_CURRENCIES = ['TRY', 'PLN', 'THB', 'MXN'];

exports.getLatestRates = async (req, res, next) => {
  try {
    const base = req.query.base || 'EUR';
    const data = await rateService.getLatestRates(base);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.convertCurrency = async (req, res, next) => {
  try {
    const { from, to, amount } = req.body;
    
    // Validate excluded currencies
    if (EXCLUDED_CURRENCIES.includes(from) || EXCLUDED_CURRENCIES.includes(to)) {
      return res.status(400).json({ 
        message: 'Conversion involving this currency is not allowed.',
        excludedCurrencies: EXCLUDED_CURRENCIES
      });
    }
    
    const data = await rateService.convertCurrency(from, to, amount);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getHistoricalRates = async (req, res, next) => {
  try {
    const { base, start, end, page = 1, limit = 10 } = req.query;
    
    // Validate required parameters
    if (!base || !start || !end) {
      return res.status(400).json({ 
        message: 'Missing required parameters: base, start (YYYY-MM-DD), end (YYYY-MM-DD)' 
      });
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start) || !dateRegex.test(end)) {
      return res.status(400).json({ 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }
    
    const pageNum = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    
    const data = await rateService.getHistoricalRates(base, start, end, pageNum, pageSize);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
