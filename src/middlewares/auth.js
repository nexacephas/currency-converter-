const jwt = require("jsonwebtoken");
const { logger } = require("../lib/logger");
const config = require("../config");

/**
 * JWT Authentication Middleware
 * Extracts and validates JWT token from Authorization header
 * Attaches decoded user to req.user
 */
module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    logger.warn(`[${req.correlationId}] Authorization header missing from ${req.ip}`);
    return res.status(401).json({ 
      message: "Authorization header missing",
      correlationId: req.correlationId
    });
  }

  // Extract token from "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    logger.warn(`[${req.correlationId}] Invalid authorization header format from ${req.ip}`);
    return res.status(401).json({ 
      message: "Invalid authorization header format. Use 'Bearer <token>'",
      correlationId: req.correlationId
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId || decoded.id,
      clientId: decoded.clientId || decoded.userId,
      email: decoded.email,
      role: decoded.role || 'user',
      permissions: decoded.permissions || []
    };
    
    // Log successful authentication
    logger.debug(`[${req.correlationId}] User authenticated: ${req.user.clientId} (role: ${req.user.role})`);
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      logger.warn(`[${req.correlationId}] Token expired for ${req.ip}`);
      return res.status(401).json({ 
        message: "Token expired",
        correlationId: req.correlationId
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      logger.warn(`[${req.correlationId}] Invalid token from ${req.ip}: ${err.message}`);
      return res.status(403).json({ 
        message: "Invalid token",
        correlationId: req.correlationId
      });
    }
    
    logger.error(`[${req.correlationId}] Token verification error: ${err.message}`);
    return res.status(403).json({ 
      message: "Token verification failed",
      correlationId: req.correlationId
    });
  }
};
