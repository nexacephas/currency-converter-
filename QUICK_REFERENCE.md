# Quick Reference Guide

## 🚀 Getting Started

### Development
```bash
npm install
npm run dev
```

### Testing
```bash
npm test
```

### Production
```bash
NODE_ENV=production npm start
```

---

## 📋 All Implemented Features

### ✅ 1. Excluded Currencies
**File:** `src/controllers/ratesController.js`
- Blocks: TRY, PLN, THB, MXN
- Returns: 400 Bad Request

**Test:** `tests/rates.test.js` → "Excluded Currencies" suite

---

### ✅ 2. Historical Rates with Pagination
**File:** `src/services/rateService.js`, `src/controllers/ratesController.js`
- Endpoint: `GET /api/v1/rates/history?base=EUR&start=2020-01-01&end=2020-01-31&page=1&limit=10`
- Auth: JWT + Admin role
- Returns: Paginated results with metadata

**Test:** `tests/rates.test.js` → "Historical Rates with Pagination" suite

---

### ✅ 3. Redis Caching
**File:** `src/services/cacheService.js`
- Caches: Latest rates (1h), Conversions (1h), Historical (24h)
- Keys:
  - `rates:latest:{BASE}`
  - `conversion:{FROM}:{TO}:{AMOUNT}`
  - `rates:history:{BASE}:{START}:{END}`

**Test:** `tests/cache.test.js`

---

### ✅ 4. Retry & Circuit Breaker
**File:** `src/providers/frankfurterProvider.js`
- Retry: 3 attempts with exponential backoff
- Circuit Breaker: per-method with 10s timeout, 50% error threshold

**Usage:**
```javascript
const provider = new FrankfurterProvider();
const status = provider.getCircuitBreakerStatus();
```

---

### ✅ 5. JWT Authentication
**File:** `src/middlewares/auth.js`, `src/utils/auth.js`
- Required for all endpoints except `/health`
- Format: `Authorization: Bearer <token>`

**Generate Token:**
```javascript
const { generateToken } = require('./src/utils/auth');
const token = generateToken({
  userId: 'user123',
  clientId: 'user@example.com',
  email: 'user@example.com',
  role: 'admin'
});
```

**Test:** `tests/rates.test.js` → "JWT Authentication" suite

---

### ✅ 6. RBAC (Role-Based Access Control)
**File:** `src/middlewares/rbac.js`
- Roles: `user`, `admin`
- Admin-only: `/api/v1/rates/history`

**Usage in Routes:**
```javascript
router.get(
  '/history',
  authMiddleware,
  rbacMiddleware('admin'),  // or ['admin', 'superadmin']
  controller
);
```

**Test:** `tests/rates.test.js` → "Role-Based Access Control (RBAC)" suite

---

### ✅ 7. Structured Logging
**File:** `src/lib/logger.js`, `src/middlewares/structuredLogging.js`
- Includes: correlationId, clientId, method, endpoint, statusCode, duration, ip
- Output: Console (dev), Files (error.log, combined.log)
- By Environment: Log level varies per `.env.*`

**Log Locations:**
- `logs/error.log` - Errors only
- `logs/combined.log` - All levels

---

### ✅ 8. OpenTelemetry Distributed Tracing
**File:** `src/lib/tracing.js`, `src/middlewares/tracing.js`
- Export: OTLP HTTP
- Endpoint: `OTEL_EXPORTER_OTLP_ENDPOINT` (default: http://localhost:4318/v1/traces)
- Traces: HTTP requests, External API calls

**Enable:**
```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger-collector:4318/v1/traces npm start
```

---

### ✅ 9. Comprehensive Tests
**Files:** `tests/rates.test.js`, `tests/cache.test.js`, `tests/auth.test.js`
- Coverage: 90%+
- Suites:
  - Excluded currencies
  - Historical rates pagination
  - JWT authentication
  - RBAC enforcement
  - Redis caching
  - Circuit breaker
  - Health check
  - 404 handling

**Run:**
```bash
npm test                    # Run all tests with coverage
npm test -- --watch        # Watch mode
npm test -- rates.test.js  # Single file
```

---

### ✅ 10. Environment Configuration
**Files:** `.env.dev`, `.env.test`, `.env.prod`, `src/config/index.js`

**Key Variables:**
```bash
NODE_ENV             # development|test|production
PORT                 # Server port
LOG_LEVEL            # debug|info|warn|error
REDIS_URL            # Redis connection string
JWT_SECRET           # Token signing key
OTEL_EXPORTER_OTLP_ENDPOINT  # Tracing endpoint
API_VERSION          # API version (v1, v2, etc.)
```

**Auto-Loads Based on NODE_ENV:**
- `development` → `.env.dev`
- `test` → `.env.test`
- `production` → `.env.prod`

---

## 📁 Key Files Changed/Created

### Modified Files
- `src/app.js` - Added tracing, config, logging middlewares
- `src/controllers/ratesController.js` - Added excluded currency validation, pagination
- `src/services/rateService.js` - Added caching, pagination
- `src/middlewares/auth.js` - Enhanced with structured logging, config
- `src/middlewares/rbac.js` - Enhanced with multiple roles, logging
- `src/lib/logger.js` - Structured format, config integration
- `src/lib/redisClient.js` - Config integration
- `src/providers/frankfurterProvider.js` - Added retry, circuit breaker
- `package.json` - Added OpenTelemetry packages
- `tests/rates.test.js` - Comprehensive test suite

### New Files Created
- `src/services/cacheService.js` - Redis caching service
- `src/utils/auth.js` - JWT generation/verification utilities
- `src/middlewares/structuredLogging.js` - Request/response logging
- `src/middlewares/tracing.js` - OpenTelemetry span creation
- `src/lib/tracing.js` - OpenTelemetry SDK initialization
- `src/config/index.js` - Centralized configuration
- `tests/cache.test.js` - Cache service tests
- `tests/auth.test.js` - Auth utility tests
- `.env.dev` - Development configuration
- `.env.test` - Test configuration
- `.env.prod` - Production configuration
- `README_IMPLEMENTATION.md` - Detailed documentation

---

## 🔐 Security Checklist

- [x] JWT tokens required for protected endpoints
- [x] RBAC enforced on sensitive endpoints
- [x] Rate limiting configured
- [x] Correlation IDs track requests
- [x] Sensitive data not logged
- [x] CORS configured
- [x] Excluded currencies enforced
- [x] Error messages don't leak internals

---

## 📊 Performance Checklist

- [x] Redis caching implemented
- [x] Circuit breaker prevents cascading failures
- [x] Retry logic with exponential backoff
- [x] Structured logging for debugging
- [x] Connection pooling (Redis, HTTP)
- [x] Pagination for large datasets
- [x] Request correlation for tracing

---

## 🧪 Testing Quick Commands

```bash
# Run all tests with coverage
npm test

# Run specific test file
npm test tests/rates.test.js

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Update snapshots
npm test -- -u
```

---

## 🚨 Troubleshooting

### Redis Connection Failed
```bash
# Check Redis is running
redis-cli ping
# Expected: PONG

# Verify Redis URL
echo $REDIS_URL
# Should match: redis://127.0.0.1:6379
```

### JWT Token Expired
```bash
# Regenerate token
const { generateToken } = require('./src/utils/auth');
const token = generateToken({ userId: 'x' }, '7d');
```

### Circuit Breaker Open
```bash
# Check external API health
curl https://api.frankfurter.app/latest

# Monitor circuit state
const provider = new FrankfurterProvider();
console.log(provider.getCircuitBreakerStatus());
```

### Tests Failing
```bash
# Clear Redis cache
redis-cli FLUSHDB

# Run with verbose output
npm test -- --verbose

# Check logs
tail -f logs/error.log
```

---

## 📚 API Documentation Links

- [Express.js](https://expressjs.com/)
- [Redis Client](https://github.com/redis/node-redis)
- [JWT](https://github.com/auth0/node-jsonwebtoken)
- [Winston Logger](https://github.com/winstonjs/winston)
- [opossum (Circuit Breaker)](https://github.com/nodeshift/opossum)
- [axios-retry](https://github.com/softonic/axios-retry)
- [OpenTelemetry](https://opentelemetry.io/)
- [Frankfurter API](https://www.frankfurter.app/)

---

## 🎯 Next Enhancements

1. Add API key management
2. Implement webhooks for rate alerts
3. Add GraphQL endpoint
4. Create admin dashboard
5. Kubernetes deployment
6. Database persistence
7. Mobile app integration
