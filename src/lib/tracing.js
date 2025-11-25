// OpenTelemetry is optional - gracefully handle if not installed
let sdk = null;

try {
  const { NodeSDK } = require('@opentelemetry/sdk-node');
  const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
  const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
  const { Resource } = require('@opentelemetry/resources');
  const { SemanticResourceAttributes } = require('@opentelemetry/resources');
  const config = require('../config');
  const { logger } = require('./logger');

  sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'currency-api',
      [SemanticResourceAttributes.SERVICE_VERSION]: config.serviceVersion,
      environment: config.nodeEnv,
    }),
    traceExporter: new OTLPTraceExporter({
      url: config.otelEndpoint,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start()
    .then(() => logger.info('OpenTelemetry SDK started'))
    .catch((err) => logger.warn('Failed to start OpenTelemetry SDK:', err.message));

  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => logger.info('OpenTelemetry SDK shut down'))
      .catch((err) => logger.warn('Error shutting down OpenTelemetry SDK:', err.message));
  });
} catch (err) {
  console.warn('OpenTelemetry packages not available. Distributed tracing disabled.', err.message);
}

module.exports = sdk;
