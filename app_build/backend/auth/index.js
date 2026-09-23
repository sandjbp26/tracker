/**
 * Auth Module Entrypoint
 */

const authRoutes = require('./auth.routes');
const authController = require('./auth.controller');
const { authenticateToken, JWT_SECRET } = require('./auth.middleware');
const { validateSignupInput, validateSigninInput } = require('./auth.validator');

module.exports = {
  authRoutes,
  authController,
  authenticateToken,
  JWT_SECRET,
  validateSignupInput,
  validateSigninInput
};
