/**
 * Transaction Controller
 * Handles CRUD operations and financial analytics for income and expenses.
 */

const { Transaction, TransactionModel } = require('../models/Transaction');
const { Category } = require('../models/Category');

// In-Memory Storage Fallback (stores transactions per user if database is not active)
let inMemoryTransactions = [];

/**
 * POST /api/transactions
 * Add a new Income or Expense transaction
 */
const createTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, amount, type, categoryId, date, paymentMethod, notes } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Transaction title is required.' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number.' });
    }

    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be either "income" or "expense".' });
    }

    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }

    const transactionData = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      categoryId,
      title: title.trim(),
      amount: numAmount,
      type,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      paymentMethod: paymentMethod || 'card',
      notes: notes ? notes.trim() : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    inMemoryTransactions.unshift(transactionData);

    return res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully.',
      data: transactionData
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return res.status(500).json({ success: false, message: 'Failed to record transaction.' });
  }
};

/**
 * GET /api/transactions
 * Get all transactions for the logged-in user with search, filtering, and sorting
 */
const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, categoryId, startDate, endDate, search, sortBy = 'date', sortOrder = 'desc' } = req.query;

    let userTransactions = inMemoryTransactions.filter((txn) => String(txn.userId) === String(userId));

    // Filter by Type (income/expense)
    if (type && ['income', 'expense'].includes(type)) {
      userTransactions = userTransactions.filter((t) => t.type === type);
    }

    // Filter by Category
    if (categoryId && categoryId !== 'all') {
      userTransactions = userTransactions.filter((t) => String(t.categoryId) === String(categoryId));
    }

    // Filter by Date Range
    if (startDate) {
      const start = new Date(startDate).getTime();
      userTransactions = userTransactions.filter((t) => new Date(t.date).getTime() >= start);
    }
    if (endDate) {
      const end = new Date(endDate).getTime();
      userTransactions = userTransactions.filter((t) => new Date(t.date).getTime() <= end);
    }

    // Filter by Search Query
    if (search && search.trim().length > 0) {
      const query = search.toLowerCase().trim();
      userTransactions = userTransactions.filter(
        (t) => t.title.toLowerCase().includes(query) || (t.notes && t.notes.toLowerCase().includes(query))
      );
    }

    // Sorting
    userTransactions.sort((a, b) => {
      if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      if (sortBy === 'title') {
        return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      }
      // Default: date
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return res.status(200).json({
      success: true,
      count: userTransactions.length,
      data: userTransactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch transactions.' });
  }
};

/**
 * GET /api/transactions/:id
 * Get a specific transaction by ID
 */
const getTransactionById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const transaction = inMemoryTransactions.find(
      (t) => t.id === id && String(t.userId) === String(userId)
    );

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    return res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error fetching transaction by id:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch transaction.' });
  }
};

/**
 * PUT /api/transactions/:id
 * Update an existing transaction
 */
const updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, amount, type, categoryId, date, paymentMethod, notes } = req.body;

    const index = inMemoryTransactions.findIndex(
      (t) => t.id === id && String(t.userId) === String(userId)
    );

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Transaction not found or unauthorized.' });
    }

    const current = inMemoryTransactions[index];

    const updated = {
      ...current,
      title: title !== undefined ? title.trim() : current.title,
      amount: amount !== undefined ? parseFloat(amount) : current.amount,
      type: type !== undefined ? type : current.type,
      categoryId: categoryId !== undefined ? categoryId : current.categoryId,
      date: date !== undefined ? new Date(date).toISOString() : current.date,
      paymentMethod: paymentMethod !== undefined ? paymentMethod : current.paymentMethod,
      notes: notes !== undefined ? notes.trim() : current.notes,
      updatedAt: new Date().toISOString()
    };

    inMemoryTransactions[index] = updated;

    return res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      data: updated
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return res.status(500).json({ success: false, message: 'Failed to update transaction.' });
  }
};

/**
 * DELETE /api/transactions/:id
 * Delete a transaction
 */
const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const initialLength = inMemoryTransactions.length;
    inMemoryTransactions = inMemoryTransactions.filter(
      (t) => !(t.id === id && String(t.userId) === String(userId))
    );

    if (inMemoryTransactions.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Transaction not found or unauthorized.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete transaction.' });
  }
};

/**
 * GET /api/transactions/analytics/summary
 * Calculate financial totals and category breakdown for dashboard
 */
const getAnalyticsSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    let userTransactions = inMemoryTransactions.filter((t) => String(t.userId) === String(userId));

    // Filter by specific month/year if supplied
    if (month && year) {
      userTransactions = userTransactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() + 1 === parseInt(month, 10) && d.getFullYear() === parseInt(year, 10);
      });
    }

    let totalIncome = 0;
    let totalExpense = 0;
    const categorySpending = {};

    userTransactions.forEach((txn) => {
      if (txn.type === 'income') {
        totalIncome += txn.amount;
      } else if (txn.type === 'expense') {
        totalExpense += txn.amount;
        categorySpending[txn.categoryId] = (categorySpending[txn.categoryId] || 0) + txn.amount;
      }
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

    return res.status(200).json({
      success: true,
      summary: {
        totalIncome,
        totalExpense,
        netSavings,
        savingsRate: Number(savingsRate),
        transactionCount: userTransactions.length,
        categorySpending
      }
    });
  } catch (error) {
    console.error('Error calculating analytics summary:', error);
    return res.status(500).json({ success: false, message: 'Failed to calculate analytics.' });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getAnalyticsSummary,
  inMemoryTransactions
};
