const { logger } = require("../lib/logger");

/**
 * Role-Based Access Control (RBAC) Middleware
 * Validates that the authenticated user has one of the required roles
 * 
 * @param {string|string[]} requiredRoles - Single role or array of roles required
 * @returns {Function} Express middleware
 */
module.exports = function authorizeRole(requiredRoles) {
  // Normalize to array
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return (req, res, next) => {
    if (!req.user) {
      logger.warn(`[${req.correlationId}] RBAC: No authenticated user from ${req.ip}`);
      return res.status(401).json({ 
        message: "Authentication required",
        correlationId: req.correlationId
      });
    }

    const userRole = req.user.role || 'user';

    if (!roles.includes(userRole)) {
      logger.warn(
        `[${req.correlationId}] RBAC: User ${req.user.clientId} with role '${userRole}' ` +
        `attempted to access resource requiring [${roles.join(', ')}] from ${req.ip}`
      );
      return res.status(403).json({ 
        message: `Forbidden: insufficient permissions. Required roles: [${roles.join(', ')}]`,
        correlationId: req.correlationId
      });
    }

    logger.debug(`[${req.correlationId}] RBAC: User ${req.user.clientId} authorized with role '${userRole}'`);
    next();
  };
};

