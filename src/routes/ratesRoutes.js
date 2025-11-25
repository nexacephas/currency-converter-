const express = require('express');
const router = express.Router();
const ratesController = require('../controllers/ratesController');
const authMiddleware = require('../middlewares/auth');
const rbacMiddleware = require('../middlewares/rbac');

// GET latest exchange rates
router.get('/latest', ratesController.getLatestRates);

// POST convert currency
router.post('/convert', ratesController.convertCurrency);

// GET historical rates (Admin only)
router.get(
  '/history',
  authMiddleware,         // JWT auth
  rbacMiddleware('admin'), // RBAC: Admin only
  ratesController.getHistoricalRates
);

module.exports = router;
