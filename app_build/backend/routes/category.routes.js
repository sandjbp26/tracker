/**
 * Category API Routes
 * Endpoints for /api/categories
 */

const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');
const { authenticateToken } = require('../auth/auth.middleware');

// All category routes are protected
router.use(authenticateToken);

router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
