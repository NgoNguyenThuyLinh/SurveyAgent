// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware to verify JWT token
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Add user to request object
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
      message: 'Access denied. Admin privileges required.'
    });
  }
};

/**
 * Middleware to check if user is creator or admin
 */
exports.isCreatorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'creator' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Creator or admin privileges required.'
    });
  }
};

/**
 * @deprecated Legacy alias for backwards compatibility. Use isCreatorOrAdmin instead.
 * Will be removed in v2.0
 */
exports.isTeacherOrAdmin = exports.isCreatorOrAdmin;

/**
 * Middleware to optionally verify JWT token
 * Does not block request if token is missing or invalid, just leaves req.user as null
 */
exports.optionalAuthenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id
    const user = await User.findByPk(decoded.id);

    // Add user to request object if found
    req.user = user || null;
    next();
  } catch (error) {
    // If token is invalid, just proceed as anonymous
    req.user = null;
    next();
  }
};
