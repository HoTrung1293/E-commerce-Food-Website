const { getRolesByUserId } = require('../services/authService');

/**
 * Middleware to authorize roles.
 * Supports both specific role string and array of roles.
 * If roles are not present in token, it fetches from DB.
 */
function authorizeRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // 1. Check if roles are already in the token payload (if we decide to add them there)
      let userRoles = req.tokenPayload?.roles;

      // 2. If not in token, fetch from DB
      if (!userRoles) {
        userRoles = await getRolesByUserId(req.userId);
        // Optional: attach to req object for subsequent middlewares
        req.userRoles = userRoles;
      }

      const hasRole = allowedRoles.some(role => userRoles.includes(role));

      if (!hasRole) {
        return res.status(403).json({ 
          success: false, 
          message: 'Forbidden: You do not have permission to access this resource' 
        });
      }

      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({ success: false, message: 'Server error during authorization' });
    }
  };
}

module.exports = authorizeRole;
