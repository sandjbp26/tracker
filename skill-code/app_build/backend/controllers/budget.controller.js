/**
 * Budget Controller
 * Manages monthly spending limits and computes budget health.
 */

const { inMemoryTransactions } = require('./transaction.controller');

let userBudgets = [];

/**
 * GET /api/budgets
 * Get budgets for specified month and year, including spending comparison
 */
const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    // Find budgets for user for this month/year
    const currentBudgets = userBudgets.filter(
      (b) => String(b.userId) === String(userId) && b.month === month && b.year === year
    );

    // Calculate actual spending in this month/year
    const monthlyExpenses = inMemoryTransactions.filter((t) => {
      if (String(t.userId) !== String(userId) || t.type !== 'expense') return false;
      const d = new Date(t.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    const categorySpending = {};
    let totalMonthlySpent = 0;

    monthlyExpenses.forEach((t) => {
      totalMonthlySpent += t.amount;
      categorySpending[t.categoryId] = (categorySpending[t.categoryId] || 0) + t.amount;
    });

    // Merge budgets with spending
    const enrichedBudgets = currentBudgets.map((b) => {
      const spent = b.categoryId === 'overall' ? totalMonthlySpent : categorySpending[b.categoryId] || 0;
      const remaining = Math.max(0, b.limitAmount - spent);
      const percentage = b.limitAmount > 0 ? Math.min(100, Math.round((spent / b.limitAmount) * 100)) : 0;
      const status = percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'safe';

      return {
        ...b,
        spent,
        remaining,
        percentage,
        status
      };
    });

    return res.status(200).json({
      success: true,
      month,
      year,
      totalMonthlySpent,
      budgets: enrichedBudgets
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch budgets.' });
  }
};

/**
 * POST /api/budgets
 * Set or update a budget limit for a category/overall
 */
const setBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { categoryId = 'overall', month, year, limitAmount } = req.body;

    const numMonth = parseInt(month, 10);
    const numYear = parseInt(year, 10);
    const numLimit = parseFloat(limitAmount);

    if (isNaN(numMonth) || numMonth < 1 || numMonth > 12) {
      return res.status(400).json({ success: false, message: 'Valid month (1-12) is required.' });
    }
    if (isNaN(numYear) || numYear < 2000) {
      return res.status(400).json({ success: false, message: 'Valid year is required.' });
    }
    if (isNaN(numLimit) || numLimit < 0) {
      return res.status(400).json({ success: false, message: 'Valid limit amount is required.' });
    }

    const existingIndex = userBudgets.findIndex(
      (b) =>
        String(b.userId) === String(userId) &&
        b.month === numMonth &&
        b.year === numYear &&
        String(b.categoryId) === String(categoryId)
    );

    let budgetRecord;

    if (existingIndex !== -1) {
      userBudgets[existingIndex].limitAmount = numLimit;
      userBudgets[existingIndex].updatedAt = new Date().toISOString();
      budgetRecord = userBudgets[existingIndex];
    } else {
      budgetRecord = {
        id: `bgt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        categoryId,
        month: numMonth,
        year: numYear,
        limitAmount: numLimit,
        createdAt: new Date().toISOString()
      };
      userBudgets.push(budgetRecord);
    }

    return res.status(200).json({
      success: true,
      message: 'Budget limit saved successfully.',
      data: budgetRecord
    });
  } catch (error) {
    console.error('Error setting budget:', error);
    return res.status(500).json({ success: false, message: 'Failed to save budget.' });
  }
};

/**
 * DELETE /api/budgets/:id
 * Remove a budget target
 */
const deleteBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const initialLength = userBudgets.length;
    userBudgets = userBudgets.filter(
      (b) => !(b.id === id && String(b.userId) === String(userId))
    );

    if (userBudgets.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Budget limit not found.' });
    }

    return res.status(200).json({ success: true, message: 'Budget limit removed successfully.' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete budget.' });
  }
};

module.exports = {
  getBudgets,
  setBudget,
  deleteBudget,
  userBudgets
};
