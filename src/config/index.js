const path = require('path');
const fs = require('fs');
require('dotenv').config();

/**
 * Environment Configuration Module
 * Loads configuration from environment files based on NODE_ENV
 */

const env = process.env.NODE_ENV || 'development';
const envFile = path.join(__dirname, `../../.env.${env}`);

// Load environment-specific file if it exists
if (fs.existsSync(envFile)) {
  require('dotenv').config({ path: envFile });
}

const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'secretkey',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // OpenTelemetry
  otelEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
  serviceVersion: process.env.SERVICE_VERSION || '1.0.0',

  // API
  apiVersion: process.env.API_VERSION || 'v1',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',

  // Rate Limiting
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15,
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,

  // Helper methods
  isDevelopment() {
    return this.nodeEnv === 'development';
  },

  isProduction() {
    return this.nodeEnv === 'production';
  },

  isTest() {
    return this.nodeEnv === 'test';
  },
};

module.exports = config;
