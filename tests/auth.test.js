// === FILE: tests/auth.test.js ===
const { generateToken, verifyToken } = require('../src/utils/auth');

describe('Auth Utilities', () => {
  test('should generate valid JWT token', () => {
    const payload = {
      userId: 'user123',
      email: 'user@example.com',
      role: 'user'
    };

    const token = generateToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  test('should verify generated token', () => {
    const payload = {
      userId: 'user123',
      email: 'user@example.com',
      role: 'admin'
    };

    const token = generateToken(payload);
    const decoded = verifyToken(token);

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  test('should include custom expiration in token', () => {
    const payload = { userId: 'user123' };
    const token = generateToken(payload, '1h');

    const decoded = verifyToken(token);
    expect(decoded).toHaveProperty('exp');
  });

  test('should reject invalid token', () => {
    expect(() => {
      verifyToken('invalid.token.here');
    }).toThrow();
  });

  test('should reject malformed token', () => {
    expect(() => {
      verifyToken('not-a-jwt');
    }).toThrow();
  });

  test('should generate token with default expiration', () => {
    const payload = { userId: 'user123' };
    const token = generateToken(payload);

    const decoded = verifyToken(token);
    // Token should have exp claim
    expect(decoded).toHaveProperty('exp');
  });
});
