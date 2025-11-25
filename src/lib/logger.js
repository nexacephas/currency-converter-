// === FILE: src/lib/logger.js ===
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, json } = format;
const config = require('../config');

// Structured log format with all required fields
const structuredFormat = printf(({ level, message, timestamp, correlationId, clientId, method, endpoint, statusCode, duration, ip, ...meta }) => {
  const logEntry = {
    timestamp,
    level,
    message,
    correlationId,
    clientId,
    method,
    endpoint,
    statusCode,
    duration,
    ip,
    ...meta
  };
  return JSON.stringify(logEntry);
});

const logger = createLogger({
  level: config.logLevel,
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
  defaultMeta: { service: 'currency-api', environment: config.nodeEnv },
  transports: [
    new transports.Console({ 
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`)
      )
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

// Create a stream for morgan
const stream = {
  write: (message) => logger.info(message.trim())
};

/**
 * Log HTTP request with structured fields
 */
function logRequest(correlationId, clientId, method, endpoint, ip) {
  logger.info(`${method} ${endpoint}`, {
    correlationId,
    clientId,
    method,
    endpoint,
    ip
  });
}

/**
 * Log HTTP response with structured fields
 */
function logResponse(correlationId, clientId, method, endpoint, statusCode, duration, ip) {
  const level = statusCode >= 400 ? 'warn' : 'info';
  logger[level](`${method} ${endpoint} - ${statusCode}`, {
    correlationId,
    clientId,
    method,
    endpoint,
    statusCode,
    duration: `${duration}ms`,
    ip
  });
}

module.exports = { logger, stream, logRequest, logResponse };


