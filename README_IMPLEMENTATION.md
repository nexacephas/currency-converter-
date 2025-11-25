# Currency API - Complete Implementation

## Overview

A production-ready currency conversion API with comprehensive features for security, resilience, observability, and scalability.

## Features Implemented

### 1. ✅ Excluded Currencies
- Rejects conversions involving TRY, PLN, THB, MXN
- Returns 400 status with detailed error message
- **Endpoint:** `POST /api/v1/rates/convert`

### 2. ✅ Historical Exchange Rates with Pagination
- Fetch historical rates for a given date range
- Supports pagination with `page` and `limit` query parameters
- Returns pagination metadata (totalCount, totalPages, hasNextPage, etc.)
- **Endpoint:** `GET /api/v1/rates/history?base=EUR&start=2020-01-01&end=2020-01-31&page=1&limit=10`
- **Auth:** Requires JWT + Admin role

### 3. ✅ Resilience & Performance
- **Caching:** Redis caches latest rates (1 hour TTL), conversions (1 hour TTL), historical rates (24 hour TTL)
- **Retry:** axios-retry with exponential backoff (3 retries)
- **Circuit Breaker:** opossum implementation for each API method
  - 10-second timeout
  - 50% error threshold to open circuit
  - 30-second reset timeout

### 4. ✅ Security
- **JWT Authentication:** Protects all endpoints except `/health`
- **RBAC:** Role-based access control with support for user, admin roles
- **Token Structure:** Includes userId, clientId, email, role, permissions
- **Error Handling:** Detailed error messages for token issues

### 5. ✅ Observability / Distributed Tracing
- **Structured Logging:** Winston logger with:
  - Client IP tracking
  - JWT clientId tracking
  - HTTP method, endpoint, response code
  - Request duration
  - Correlation IDs
- **OpenTelemetry:** Full distributed tracing with OTLP exporter
  - Traces HTTP requests and their spans
  - Tracks Frankfurter API calls
  - Status codes and error information

### 6. ✅ Testing Coverage
- **Unit Tests:** Cache service, Auth utilities
- **Integration Tests:** All API endpoints with various scenarios
- **Coverage Areas:**
  - Excluded currency validation
  - Historical rates pagination
  - JWT authentication
  - RBAC enforcement
  - Redis caching
  - Circuit breaker behavior
  - Health check
  - 404 handling

### 7. ✅ Deployment & Scalability
- **API Versioning:** `GET /api/v1/...` (easily add v2, v3 etc.)
- **Multi-Environment Config:**
  - `.env.dev` - Development configuration
  - `.env.test` - Test configuration with separate Redis DB
  - `.env.prod` - Production configuration
- **Stateless Design:** All state in Redis, can run multiple instances
- **Environment-Aware Logging:** Log levels and output differ per environment

## Environment Configuration

### Available Variables

```bash
# Server
NODE_ENV=development|test|production
PORT=3000
LOG_LEVEL=debug|info|warn|error

# Redis
REDIS_URL=redis://127.0.0.1:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
SERVICE_VERSION=1.0.0

# API
API_VERSION=v1

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### Loading Configuration

The application automatically loads environment-specific config files:

```bash
# Development
npm run dev  # Loads .env.dev

# Testing
npm test  # Loads .env.test

# Production
NODE_ENV=production npm start  # Loads .env.prod
```

## Installation & Setup

### Prerequisites

- Node.js 16+
- Redis 6+
- (Optional) OpenTelemetry Collector for distributed tracing

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

Runs on http://localhost:3000

### Testing

```bash
npm test
```

Runs with coverage reporting

### Production

```bash
NODE_ENV=production npm start
```

## API Endpoints

### Public Endpoints

#### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "ok",
  "environment": "production",
  "version": "1.0.0",
  "correlationId": "uuid"
}
```

#### Latest Rates
```http
GET /api/v1/rates/latest?base=EUR
```

#### Convert Currency
```http
POST /api/v1/rates/convert
Content-Type: application/json

{
  "amount": 100,
  "from": "EUR",
  "to": "USD"
}
```

### Protected Endpoints (JWT Required)

#### Historical Rates (Admin Only)
```http
GET /api/v1/rates/history?base=EUR&start=2020-01-01&end=2020-01-31&page=1&limit=10
Authorization: Bearer <jwt-token>
```

Response:
```json
{
  "base": "EUR",
  "to": "USD",
  "start_date": "2020-01-01",
  "end_date": "2020-01-31",
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 31,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "rates": [...]
}
```

## Authentication

### Generate JWT Token

```javascript
const { generateToken } = require('./src/utils/auth');

const token = generateToken({
  userId: 'user123',
  clientId: 'user@example.com',
  email: 'user@example.com',
  role: 'admin'  // 'user' or 'admin'
});
```

### Use Token in Requests

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/v1/rates/history?base=EUR&start=2020-01-01&end=2020-01-31
```

## Redis Caching

Cache keys are automatically generated based on:

- **Latest Rates:** `rates:latest:{BASE}`
- **Conversions:** `conversion:{FROM}:{TO}:{AMOUNT}`
- **Historical Rates:** `rates:history:{BASE}:{START}:{END}`

TTLs:
- Latest rates: 1 hour
- Conversions: 1 hour
- Historical rates: 24 hours

## Logging

All logs include structured fields:

```json
{
  "timestamp": "2024-01-15 10:30:45",
  "level": "info",
  "message": "GET /api/v1/rates/latest - 200",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "clientId": "user@example.com",
  "method": "GET",
  "endpoint": "/api/v1/rates/latest",
  "statusCode": 200,
  "duration": "45ms",
  "ip": "192.168.1.100"
}
```

Logs are written to:
- Console (formatted for readability)
- `logs/error.log` (errors only)
- `logs/combined.log` (all levels)

## Distributed Tracing

With OpenTelemetry configured, traces are sent to your collector:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces npm run dev
```

Each request creates spans for:
- HTTP request handling
- External API calls to Frankfurter
- Cache operations
- Database queries

## Circuit Breaker Status

Monitor circuit breaker health:

```javascript
const provider = new FrankfurterProvider();
console.log(provider.getCircuitBreakerStatus());
```

Response:
```json
{
  "latest": {
    "state": "closed",
    "stats": { "fires": 100, "failures": 2, ... }
  },
  "convert": { ... },
  "history": { ... }
}
```

## Error Handling

### Excluded Currency (400)
```json
{
  "message": "Conversion involving this currency is not allowed.",
  "excludedCurrencies": ["TRY", "PLN", "THB", "MXN"],
  "correlationId": "uuid"
}
```

### Missing Auth Header (401)
```json
{
  "message": "Authorization header missing",
  "correlationId": "uuid"
}
```

### Insufficient Permissions (403)
```json
{
  "message": "Forbidden: insufficient permissions. Required roles: [admin]",
  "correlationId": "uuid"
}
```

### Not Found (404)
```json
{
  "error": "Not Found",
  "correlationId": "uuid"
}
```

## Directory Structure

```
currency-api/
├── src/
│   ├── app.js                 # Express app setup
│   ├── config/
│   │   └── index.js          # Configuration management
│   ├── controllers/
│   │   └── ratesController.js # Route handlers
│   ├── lib/
│   │   ├── logger.js         # Winston logger
│   │   ├── redisClient.js    # Redis connection
│   │   └── tracing.js        # OpenTelemetry setup
│   ├── middlewares/
│   │   ├── auth.js           # JWT authentication
│   │   ├── rbac.js           # Role-based access control
│   │   ├── structuredLogging.js
│   │   ├── telemetry.js      # Correlation ID
│   │   ├── tracing.js        # Request tracing
│   │   └── rateLimiter.js
│   ├── providers/
│   │   └── frankfurterProvider.js  # External API with resilience
│   ├── routes/
│   │   ├── index.js
│   │   └── ratesRoutes.js
│   ├── services/
│   │   ├── cacheService.js   # Redis caching
│   │   ├── rateService.js    # Business logic
│   │   └── historicalService.js
│   └── utils/
│       └── auth.js           # JWT generation/verification
├── tests/
│   ├── rates.test.js         # Comprehensive API tests
│   ├── cache.test.js         # Cache service tests
│   ├── auth.test.js          # Auth utility tests
│   └── health.test.js
├── logs/
│   ├── error.log
│   └── combined.log
├── .env.dev                   # Development config
├── .env.test                  # Test config
├── .env.prod                  # Production config
├── package.json
└── README.md
```

## Next Steps / Enhancements

1. **Database Integration:** Add persistent storage for user management, audit logs
2. **Rate Limiting Per User:** Implement per-user rate limits based on role
3. **Webhook Notifications:** Send alerts on circuit breaker state changes
4. **Admin Dashboard:** Web UI for monitoring rates, logs, traces
5. **GraphQL API:** Alternative to REST endpoints
6. **Kubernetes Deployment:** Add Helm charts and manifests
7. **E2E Tests:** Selenium/Cypress tests for full workflows
8. **Performance Optimization:** Query result caching, batch endpoints
9. **Mobile App:** React Native or Flutter client

## License

ISC
