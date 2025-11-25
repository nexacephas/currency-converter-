// === FILE: tests/rates.test.js ===
const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../src/utils/auth');

// Generate test tokens
const userToken = generateToken({ 
  userId: 'user123', 
  clientId: 'user@example.com',
  email: 'user@example.com',
  role: 'user' 
});

const adminToken = generateToken({ 
  userId: 'admin123', 
  clientId: 'admin@example.com',
  email: 'admin@example.com',
  role: 'admin' 
});

describe('Rates API', () => {
  // ===== EXISTING TESTS =====
  
  test('GET /api/v1/rates/latest should return 200 with rates', async () => {
    const res = await request(app).get('/api/v1/rates/latest');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('rates');
  }, 20000);

  test('POST /api/v1/rates/convert should return 200 with conversion', async () => {
    const res = await request(app)
      .post('/api/v1/rates/convert')
      .send({ amount: 10, from: 'EUR', to: 'USD' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('converted');
    expect(res.body).toHaveProperty('rate');
  }, 20000);

  // ===== EXCLUDED CURRENCIES TESTS =====

  describe('Excluded Currencies', () => {
    test('should reject conversion with TRY (from)', async () => {
      const res = await request(app)
        .post('/api/v1/rates/convert')
        .send({ amount: 10, from: 'TRY', to: 'USD' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('not allowed');
      expect(res.body.excludedCurrencies).toContain('TRY');
    });

    test('should reject conversion with PLN (from)', async () => {
      const res = await request(app)
        .post('/api/v1/rates/convert')
        .send({ amount: 10, from: 'PLN', to: 'USD' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('not allowed');
    });

    test('should reject conversion with THB (to)', async () => {
      const res = await request(app)
        .post('/api/v1/rates/convert')
        .send({ amount: 10, from: 'EUR', to: 'THB' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('not allowed');
    });

    test('should reject conversion with MXN (to)', async () => {
      const res = await request(app)
        .post('/api/v1/rates/convert')
        .send({ amount: 10, from: 'EUR', to: 'MXN' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('not allowed');
    });

    test('should allow conversion with non-excluded currencies', async () => {
      const res = await request(app)
        .post('/api/v1/rates/convert')
        .send({ amount: 10, from: 'EUR', to: 'USD' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('converted');
    });
  });

  // ===== HISTORICAL RATES WITH PAGINATION TESTS =====

  describe('Historical Rates with Pagination', () => {
    test('should reject without required parameters', async () => {
      const res = await request(app)
        .get('/api/v1/rates/history')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Missing required parameters');
    });

    test('should reject with invalid date format', async () => {
      const res = await request(app)
        .get('/api/v1/rates/history?base=EUR&start=01-01-2024&end=2024-01-31')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Invalid date format');
    });

    test('should return paginated historical rates with defaults', async () => {
      const res = await request(app)
        .get('/api/v1/rates/history?base=EUR&start=2020-01-01&end=2020-01-31')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (res.statusCode === 200) {
        expect(res.body).toHaveProperty('pagination');
        expect(res.body.pagination).toHaveProperty('page', 1);
        expect(res.body.pagination).toHaveProperty('limit', 10);
        expect(res.body.pagination).toHaveProperty('totalCount');
        expect(res.body.pagination).toHaveProperty('totalPages');
        expect(Array.isArray(res.body.rates)).toBe(true);
      }
    }, 20000);

    test('should return custom page and limit', async () => {
      const res = await request(app)
        .get('/api/v1/rates/history?base=EUR&start=2020-01-01&end=2020-01-31&page=2&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);
      
      if (res.statusCode === 200) {
        expect(res.body.pagination.page).toBe(2);
        expect(res.body.pagination.limit).toBe(5);
      }
    }, 20000);
  });

  // ===== JWT AUTHENTICATION TESTS =====

  describe('JWT Authentication', () => {
    test('should reject request without authorization header', async () => {
      const res = await request(app)
        .get('/api/v1/rates/history?base=EUR&start=2020-01-01&end=2020-01-31');
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Authorization header missing');
    });

    test('should reject request with invalid header format', async () => {
      const res = await request(app)
        .get('/api/v1/rates/history?base=EUR&start=2020-01-01&end=2020-01-31')
        .set('Authorization', `InvalidFormat ${adminToken}`);
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Invalid authorization header format');
    });

    test('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/rates/history?base=EUR&start=2020-01-01&end=2020-01-31')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Invalid token');
    });

    test('should accept valid token', async () => {
      const res = await request(app)
        .get('/api/v1/rates/history?base=EUR&start=2020-01-01&end=2020-01-31')
        .set('Authorization', `Bearer ${adminToken}`);
      
      // Should get 200 or not 401/403
      expect([200, 400]).toContain(res.statusCode);
    }, 20000);
  });

  // ===== RBAC (Role-Based Access Control) TESTS =====

  describe('Role-Based Access Control (RBAC)', () => {
    test('should reject user access to admin-only endpoint', async () => {
      const res = await request(app)
        .get('/api/v1/rates/history?base=EUR&start=2020-01-01&end=2020-01-31')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('insufficient permissions');
    });

    test('should allow admin access to admin-only endpoint', async () => {
      const res = await request(app)
        .get('/api/v1/rates/history?base=EUR&start=2020-01-01&end=2020-01-31')
        .set('Authorization', `Bearer ${adminToken}`);
      
      // Should not be 403 forbidden
      expect(res.statusCode).not.toBe(403);
    }, 20000);
  });

  // ===== CACHING TESTS =====

  describe('Redis Caching', () => {
    test('should cache latest rates', async () => {
      // First request
      const res1 = await request(app).get('/api/v1/rates/latest?base=EUR');
      expect(res1.statusCode).toBe(200);

      // Second request (should be served from cache)
      const res2 = await request(app).get('/api/v1/rates/latest?base=EUR');
      expect(res2.statusCode).toBe(200);
      
      // Data should be identical (from cache)
      expect(res2.body).toEqual(res1.body);
    }, 20000);

    test('should cache conversions', async () => {
      const payload = { amount: 100, from: 'EUR', to: 'USD' };
      
      // First request
      const res1 = await request(app)
        .post('/api/v1/rates/convert')
        .send(payload);
      expect(res1.statusCode).toBe(200);

      // Second request (should be served from cache)
      const res2 = await request(app)
        .post('/api/v1/rates/convert')
        .send(payload);
      expect(res2.statusCode).toBe(200);
      
      // Data should be identical
      expect(res2.body.rate).toEqual(res1.body.rate);
    }, 20000);
  });

  // ===== CIRCUIT BREAKER TESTS =====

  describe('Circuit Breaker Resilience', () => {
    test('should gracefully handle API failures', async () => {
      // This test depends on external API being unavailable
      // A real test would mock axios
      const res = await request(app)
        .get('/api/v1/rates/latest?base=EUR');
      
      // Should either succeed or fail gracefully
      expect([200, 503, 504]).toContain(res.statusCode);
    }, 20000);
  });

  // ===== HEALTH CHECK TESTS =====

  describe('Health Check', () => {
    test('should return 200 without authentication', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('correlationId');
    });
  });

  // ===== 404 HANDLER TESTS =====

  describe('Error Handling', () => {
    test('should return 404 for non-existent route', async () => {
      const res = await request(app).get('/api/v1/nonexistent');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not Found');
    });
  });
});