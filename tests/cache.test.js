// === FILE: tests/cache.test.js ===
const CacheService = require('../src/services/cacheService');

describe('Cache Service', () => {
  let cacheService;

  beforeEach(() => {
    cacheService = new CacheService();
  });

  test('should initialize cache service', () => {
    expect(cacheService).toBeDefined();
    expect(typeof cacheService.get).toBe('function');
    expect(typeof cacheService.set).toBe('function');
    expect(typeof cacheService.delete).toBe('function');
  });

  test('should generate latest rates cache key', () => {
    const key = cacheService.getLatestRatesCacheKey('eur');
    expect(key).toBe('rates:latest:EUR');
  });

  test('should generate historical rates cache key', () => {
    const key = cacheService.getHistoricalRatesCacheKey('EUR', '2020-01-01', '2020-01-31');
    expect(key).toBe('rates:history:EUR:2020-01-01:2020-01-31');
  });

  test('should generate conversion cache key', () => {
    const key = cacheService.getConversionCacheKey('eur', 'usd', 100);
    expect(key).toBe('conversion:EUR:USD:100');
  });

  test('should handle cache get gracefully when client not initialized', async () => {
    const cacheService2 = new CacheService();
    const result = await cacheService2.get('nonexistent-key');
    expect(result).toBeNull();
  });

  test('should handle cache set gracefully when client not initialized', async () => {
    const cacheService2 = new CacheService();
    await expect(cacheService2.set('key', { value: 'test' })).resolves.not.toThrow();
  });

  test('should handle cache delete gracefully when client not initialized', async () => {
    const cacheService2 = new CacheService();
    await expect(cacheService2.delete('key')).resolves.not.toThrow();
  });

  test('should handle cache clear gracefully when client not initialized', async () => {
    const cacheService2 = new CacheService();
    await expect(cacheService2.clear()).resolves.not.toThrow();
  });
});
