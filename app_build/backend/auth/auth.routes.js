/**
 * Authentication Routes Definition
 * Endpoints for /api/auth
 */

const express = require('express');
const router = express.Router();
const { signup, signin, getMe, logout } = require('./auth.controller');
const { authenticateToken } = require('./auth.middleware');

// Public Auth Endpoints
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/login', signin); // Alias for convenience

// Protected Auth Endpoints
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);

module.exports = router;
