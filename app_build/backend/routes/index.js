/**
 * Unified API Routes Dispatcher
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('../auth/auth.routes');
const transactionRoutes = require('./transaction.routes');
const categoryRoutes = require('./category.routes');
const budgetRoutes = require('./budget.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/categories', categoryRoutes);
router.use('/budgets', budgetRoutes);

module.exports = router;
