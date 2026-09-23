/**
 * Category Controller
 * Manages default system categories and user-defined custom categories.
 */

const { DEFAULT_CATEGORIES } = require('../models/Category');

// In-Memory Categories Store (Initialized with default system categories)
let customCategories = [];

/**
 * GET /api/categories
 * Retrieve all categories (Default + Custom for logged-in user)
 */
const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    // Convert default categories to standard object representations
    const defaults = DEFAULT_CATEGORIES.map((cat, idx) => ({
      id: `default_${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name: cat.name,
      type: cat.type,
      icon: cat.icon,
      color: cat.color,
      isDefault: true,
      userId: null
    }));

    // Filter user's custom categories
    const userCustom = customCategories.filter((cat) => String(cat.userId) === String(userId));

    let allCategories = [...defaults, ...userCustom];

    if (type && ['income', 'expense'].includes(type)) {
      allCategories = allCategories.filter((c) => c.type === type);
    }

    return res.status(200).json({
      success: true,
      count: allCategories.length,
      data: allCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

/**
 * POST /api/categories
 * Create a new custom category for the logged-in user
 */
const createCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, icon, color, budgetLimit } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Category type must be "income" or "expense".' });
    }

    const newCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      type,
      icon: icon || (type === 'income' ? 'TrendingUp' : 'Tag'),
      color: color || '#3B82F6',
      budgetLimit: budgetLimit ? parseFloat(budgetLimit) : 0,
      isDefault: false,
      userId,
      createdAt: new Date().toISOString()
    };

    customCategories.push(newCategory);

    return res.status(201).json({
      success: true,
      message: 'Custom category created successfully.',
      data: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
};

/**
 * PUT /api/categories/:id
 * Update a user-created custom category
 */
const updateCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, icon, color, budgetLimit } = req.body;

    const index = customCategories.findIndex(
      (c) => c.id === id && String(c.userId) === String(userId)
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Custom category not found or cannot modify default category.'
      });
    }

    const current = customCategories[index];
    const updated = {
      ...current,
      name: name !== undefined ? name.trim() : current.name,
      icon: icon !== undefined ? icon : current.icon,
      color: color !== undefined ? color : current.color,
      budgetLimit: budgetLimit !== undefined ? parseFloat(budgetLimit) : current.budgetLimit,
      updatedAt: new Date().toISOString()
    };

    customCategories[index] = updated;

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      data: updated
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
};

/**
 * DELETE /api/categories/:id
 * Delete a user-created custom category
 */
const deleteCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const initialLength = customCategories.length;
    customCategories = customCategories.filter(
      (c) => !(c.id === id && String(c.userId) === String(userId))
    );

    if (customCategories.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or default categories cannot be deleted.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  customCategories
};
