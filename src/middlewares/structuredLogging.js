const { logger } = require('../lib/logger');

/**
 * Structured Logging Middleware
 * Logs all HTTP requests with:
 * - Correlation ID
 * - Client ID (from JWT if authenticated)
 * - HTTP method and endpoint
 * - Client IP address
 * - Response status code
 * - Response duration
 */
module.exports = function structuredLoggingMiddleware(req, res, next) {
  // Capture request start time
  const startTime = Date.now();
  
  // Get client IP (handle proxies)
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   'unknown';

  // Get client ID from JWT if authenticated, otherwise use IP or 'anonymous'
  const clientId = req.user?.clientId || req.user?.userId || 'anonymous';

  // Log incoming request
  logger.info(`→ ${req.method} ${req.path}`, {
    correlationId: req.correlationId,
    clientId,
    method: req.method,
    endpoint: req.path,
    ip: clientIp,
    userAgent: req.get('user-agent')
  });

  // Override res.json to capture response status
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Log outgoing response
    const level = statusCode >= 400 ? 'warn' : 'info';
    logger[level](`← ${req.method} ${req.path} ${statusCode}`, {
      correlationId: req.correlationId,
      clientId,
      method: req.method,
      endpoint: req.path,
      statusCode,
      duration: `${duration}ms`,
      ip: clientIp
    });

    return originalJson.call(this, data);
  };

  next();
};
