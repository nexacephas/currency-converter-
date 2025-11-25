// src/lib/redisClient.js
const redis = require('redis');
const { logger } = require('../logging/logger');

let client;

async function connectRedis() {
  client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  });

  client.on('error', (err) => logger.error('Redis Client Error', err));

  await client.connect();
  logger.info('Connected to Redis');

  return client;
}

function getRedisClient() {
  if (!client) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return client;
}

module.exports = { connectRedis, getRedisClient };
