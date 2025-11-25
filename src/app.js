// === FILE: src/app.js ===
// Initialize OpenTelemetry tracing first
require('./lib/tracing');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const rateLimiter = require('./middlewares/rateLimiter');
const structuredLogging = require('./middlewares/structuredLogging');
const tracingMiddleware = require('./middlewares/tracing');
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
app.use(tracingMiddleware); // OpenTelemetry tracing
app.use(morgan('combined', { stream })); // HTTP request logging
app.use(structuredLogging); // structured logging with correlation ID and client tracking
app.use(rateLimiter); // rate limiting

// --- Health Check (no auth required) ---
app.get('/health', (req, res) => res.json({ 
  status: 'ok',
  environment: config.nodeEnv,
  version: config.serviceVersion,
  correlationId: req.correlationId 
}));

// --- API Routes ---
app.use(`/api/${config.apiVersion}`, routes);

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', correlationId: req.correlationId });
});

// --- Error Handler ---
app.use((err, req, res, next) => {
  logger.error(`[${req.correlationId}] ${err.stack || err.message}`, {
    correlationId: req.correlationId,
    clientId: req.user?.clientId || 'anonymous',
    method: req.method,
    endpoint: req.path,
    ip: req.ip,
    error: err.message
  });
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error',
    correlationId: req.correlationId
  });
});

// --- Start Server ---
async function start() {
  try {
    await connectRedis();
    app.listen(config.port, () => logger.info(
      `Server running on port ${config.port} (${config.nodeEnv} environment)`
    ));
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
}

// Only start server if run directly (for testing)
if (require.main === module) start();

module.exports = app;
