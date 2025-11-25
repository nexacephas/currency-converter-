const RateService = require('../services/rateService');
const rateService = new RateService();

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
    const data = await rateService.convertCurrency(from, to, amount);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getHistoricalRates = async (req, res, next) => {
  try {
    const { base, start_date, end_date } = req.query;
    const data = await rateService.getHistoricalRates(base, start_date, end_date);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
