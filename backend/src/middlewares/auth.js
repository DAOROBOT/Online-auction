/**
 * Authentication middleware
 * Verifies JWT tokens and user permissions
 */

import jwt from 'jsonwebtoken';
import { ApiError } from './error.js';

/**
 * Verify JWT token middleware
 * Extracts and validates JWT from Authorization header
 */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return next(new ApiError(401, 'No token provided, authorization denied'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token has expired'));
    }
    return next(new ApiError(401, 'Token is not valid'));
  }
};

/**
 * Check if user is authenticated
 * Middleware to protect routes that require authentication
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }
  next();
};

/**
 * Check user role/permission
 * Middleware to protect routes based on user role
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }

    next();
  };
};

/**
 * Check if user is the owner of the resource
 * Middleware to verify user owns the resource they're modifying
 */
const requireOwnership = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }

  // Assuming userId is in the URL params and user.id from token
  const resourceUserId = req.params.userId || req.body.userId;
  if (resourceUserId && resourceUserId !== req.user.id) {
    return next(new ApiError(403, 'Not authorized to modify this resource'));
  }

  next();
};

/**
 * Optional authentication
 * Allows requests with or without token, but extracts user if provided
 */
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
    } catch (error) {
      // Silently fail - continue without auth
      console.log('Optional auth token invalid:', error.message);
    }
  }

  next();
};

export { verifyToken, requireAuth, requireRole, requireOwnership, optionalAuth };
