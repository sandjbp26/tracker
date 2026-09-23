/**
 * Transaction API Routes
 * Endpoints for /api/transactions
 */

const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getAnalyticsSummary
} = require('../controllers/transaction.controller');
const { authenticateToken } = require('../auth/auth.middleware');

// All transaction routes are strictly protected by authentication
router.use(authenticateToken);

router.get('/analytics/summary', getAnalyticsSummary);
router.get('/', getTransactions);
router.post('/', createTransaction);
router.get('/:id', getTransactionById);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
