# Currency Converter API

A simple Node.js API for fetching currency exchange rates and converting between currencies. Built with Express, Axios, and Frankfurter API as a provider.

## Features

- Fetch latest currency exchange rates
- Convert between currencies
- Modular architecture with services, controllers, and providers
- Logging using Winston
- Rate limiting and authentication middleware
- Unit tests with Jest

## Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/nexacephas/currency-converter-.git
cd currency-api



Install dependencies

npm install


Configure environment variables

# Server
PORT=3000

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=1h

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Currency API (Frankfurter)
FRANKFURTER_API=https://api.frankfurter.app
Run the server

npm start


Run tests

npm test


Test API endpoints

Get latest rates: GET http://localhost:5000/api/v1/rates/latest

Convert currency: POST http://localhost:5000/api/v1/rates/convert

Body example:

{
  "amount": 10,
  "from": "EUR",
  "to": "USD"
}

Assumptions

Supports currencies available via Frankfurter API.

No persistent database; rates are live-fetched.

Basic API endpoints do not require authentication.

Standard HTTP error codes used: 500 (server), 422 (validation).

Future Enhancements

Add multiple currency providers with fallback.

Implement caching to reduce API calls.

Add user authentication and API key management.

Deploy to cloud (Heroku, Vercel, AWS) for public access.

Include Swagger/OpenAPI documentation.

Enhance logging and telemetry analytics.


---

 After creating this file, make sure to:

```bash
git add README.md
git commit -m "Add README with setup, assumptions, and future enhancements"
git push
