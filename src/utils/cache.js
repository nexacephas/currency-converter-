// === FILE: src/utils/cache.js ===
const { getRedis } = require('../lib/redisClient');


async function getCache(key) {
try {
const client = getRedis();
return await client.get(key);
} catch (err) {
// swallow cache errors
return null;
}
}


async function setCache(key, value, ttlSeconds = 60) {
try {
const client = getRedis();
await client.setEx(key, ttlSeconds, value);
} catch (err) {
// swallow cache errors
}
}


module.exports = { getCache, setCache };