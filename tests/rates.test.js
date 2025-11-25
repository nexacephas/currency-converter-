// === FILE: tests/rates.test.js ===
const request = require('supertest');
const app = require('../src/app');


describe('Rates API', () => {
test('GET /api/v1/rates/latest', async () => {
const res = await request(app).get('/api/v1/rates/latest');
expect(res.statusCode).toBe(200);
expect(res.body).toHaveProperty('rates');
}, 20000);


test('POST /api/v1/rates/convert', async () => {
const res = await request(app).post('/api/v1/rates/convert').send({ amount: 10, from: 'EUR', to: 'USD' });
expect(res.statusCode).toBe(200);
expect(res.body).toHaveProperty('converted');
}, 20000);
});