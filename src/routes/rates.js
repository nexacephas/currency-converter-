// === FILE: src/routes/rates.js ===
const express = require('express');
const router = express.Router();
const controller = require('../controllers/ratesController');
const { authenticate, authorizeRole } = require('../middlewares/auth');


router.get('/latest', controller.getLatest);
router.post('/convert', controller.convert);
router.get('/history', authenticate, authorizeRole('admin'), controller.getHistory);


module.exports = router;