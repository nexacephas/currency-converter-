// src/lib/redisClient.js
const redis = require('redis');
const { logger } = require('../logging/logger');
const config = require('../config');

let client;

async function connectRedis() {
  client = redis.createClient({
    url: config.redisUrl,
  });

  client.on('error', (err) => logger.error('Redis Client Error', err));

  await client.connect();
  logger.info(`Connected to Redis: ${config.redisUrl}`);

  return client;
}

function getRedisClient() {
  if (!client) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return client;
}

module.exports = { connectRedis, getRedisClient };
