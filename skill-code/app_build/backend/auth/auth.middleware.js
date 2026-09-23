/**
 * Authentication & Security Middleware
 * Verifies JWT tokens from incoming Authorization headers to protect private routes.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'expense_tracker_jwt_super_secret_key_2026';

/**
 * Middleware to verify JWT token and authenticate user requests.
 * Attaches decoded user payload (id, email, name) to `req.user`.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.'
    });
  }

  // Support "Bearer <token>" or raw token
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Malformed authorization token.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, name, iat, exp }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid or corrupted token.'
    });
  }
};

module.exports = {
  authenticateToken,
  JWT_SECRET
};
