const express = require('express');
const router = express.Router();

const ratesRoutes = require('./ratesRoutes');

// All /api/v1/rates endpoints
router.use('/rates', ratesRoutes);

module.exports = router;
