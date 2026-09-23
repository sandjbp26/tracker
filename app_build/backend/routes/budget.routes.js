/**
 * Budget API Routes
 * Endpoints for /api/budgets
 */

const express = require('express');
const router = express.Router();
const { getBudgets, setBudget, deleteBudget } = require('../controllers/budget.controller');
const { authenticateToken } = require('../auth/auth.middleware');

// All budget routes are protected
router.use(authenticateToken);

router.get('/', getBudgets);
router.post('/', setBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
