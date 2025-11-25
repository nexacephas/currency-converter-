// === FILE: src/app.js ===
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimiter = require('./middlewares/rateLimiter');
const routes = require('./routes');
const { logger, stream } = require('./lib/logger');
const { connectRedis } = require('./lib/redisClient');
const telemetry = require('./middlewares/telemetry');
require('dotenv').config();

const app = express();

// --- Global Middlewares ---
app.use(cors());
app.use(express.json());
app.use(telemetry); // attach correlation ID to every request
app.use(morgan('combined', { stream })); // structured logging
app.use(rateLimiter); // rate limiting

// --- Health Check ---
app.get('/health', (req, res) => res.json({ status: 'ok', correlationId: req.correlationId }));

// --- API Routes ---
app.use('/api/v1', routes);

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', correlationId: req.correlationId });
});

// --- Error Handler ---
app.use((err, req, res, next) => {
  logger.error(`[${req.correlationId}] ${err.stack || err.message}`);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error',
    correlationId: req.correlationId
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectRedis();
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
}

// Only start server if run directly (for testing)
if (require.main === module) start();

module.exports = app;
