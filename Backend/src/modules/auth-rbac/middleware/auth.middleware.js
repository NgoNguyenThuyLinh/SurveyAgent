// src/modules/auth-rbac/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../../../models');

/**
 * Middleware to verify JWT token
 */
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

/**
 * Middleware to check if user is admin
 */
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
};

/**
 * Middleware to check if user is creator or admin
 */
exports.isCreatorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'creator')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Creator or Admin role required.'
    });
  }
};

/**
 * @deprecated Legacy alias for backwards compatibility. Use isCreatorOrAdmin instead.
 * Will be removed in v2.0
 */
exports.isTeacherOrAdmin = exports.isCreatorOrAdmin;

/**
 * Middleware to check if user owns the resource or is admin
 */
exports.isOwnerOrAdmin = (resourceUserIdField = 'created_by') => {
  return (req, res, next) => {
    const resourceUserId = req.resource?.[resourceUserIdField];
    
    if (req.user.role === 'admin' || req.user.id === resourceUserId) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this resource.'
      });
    }
  };
};

module.exports = exports;
