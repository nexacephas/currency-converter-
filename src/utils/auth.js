const jwt = require('jsonwebtoken');
const config = require('../config');
const { logger } = require('../lib/logger');

/**
 * Generate JWT token
 * @param {object} payload - Token payload (userId, email, role, etc.)
 * @param {string} expiresIn - Token expiration (default: 24h)
 * @returns {string} JWT token
 */
function generateToken(payload, expiresIn = '24h') {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token
 * @throws {Error} If token is invalid or expired
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = { generateToken, verifyToken };
