// OpenTelemetry tracing middleware - gracefully handles when packages not available
let tracer = null;
let trace = null;
let context = null;

try {
  const otelApi = require('@opentelemetry/api');
  trace = otelApi.trace;
  context = otelApi.context;
  tracer = trace.getTracer('currency-api');
} catch (err) {
  // OpenTelemetry not available - that's ok, we'll skip tracing
}

/**
 * Request Tracing Middleware
 * Creates a span for each HTTP request and tracks execution time
 * Gracefully handles when OpenTelemetry is not available
 */
module.exports = function tracingMiddleware(req, res, next) {
  // If tracing not available, just continue
  if (!tracer || !trace || !context) {
    return next();
  }

  // Create a span for this request
  const span = tracer.startSpan(`${req.method} ${req.path}`);
  
  // Add attributes to span
  span.setAttributes({
    'http.method': req.method,
    'http.url': req.url,
    'http.target': req.path,
    'http.client_ip': req.ip,
    'http.user_agent': req.get('user-agent'),
    'correlationId': req.correlationId,
    'userId': req.user?.clientId || 'anonymous'
  });

  // Run the rest of the request within the span context
  context.with(trace.setSpan(context.active(), span), () => {
    // Override res.json to capture response details
    const originalJson = res.json;
    res.json = function(data) {
      span.setAttributes({
        'http.status_code': res.statusCode,
      });
      
      if (res.statusCode >= 400) {
        span.recordException(new Error(`HTTP ${res.statusCode}`));
      }
      
      // End the span
      span.end();
      
      return originalJson.call(this, data);
    };

    // Also handle stream responses (for compatibility)
    const originalSend = res.send;
    res.send = function(data) {
      span.setAttributes({
        'http.status_code': res.statusCode,
      });
      
      if (res.statusCode >= 400) {
        span.recordException(new Error(`HTTP ${res.statusCode}`));
      }
      
      span.end();
      
      return originalSend.call(this, data);
    };

    next();
  });
};
