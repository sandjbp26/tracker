/**
 * Category Database Model & Schema
 * Represents transaction categories (both income & expense) for classification.
 */

const mongoose = require('mongoose');

// Default System Categories Seed List
const DEFAULT_CATEGORIES = [
  // Expense Categories
  { name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#EF4444', isDefault: true },
  { name: 'Groceries', type: 'expense', icon: 'ShoppingCart', color: '#F97316', isDefault: true },
  { name: 'Rent & Housing', type: 'expense', icon: 'Home', color: '#8B5CF6', isDefault: true },
  { name: 'Transportation', type: 'expense', icon: 'Car', color: '#3B82F6', isDefault: true },
  { name: 'Utilities & Bills', type: 'expense', icon: 'Zap', color: '#EAB308', isDefault: true },
  { name: 'Entertainment', type: 'expense', icon: 'Film', color: '#EC4899', isDefault: true },
  { name: 'Health & Fitness', type: 'expense', icon: 'Activity', color: '#10B981', isDefault: true },
  { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#6366F1', isDefault: true },
  
  // Income Categories
  { name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10B981', isDefault: true },
  { name: 'Freelance & Projects', type: 'income', icon: 'Code', color: '#06B6D4', isDefault: true },
  { name: 'Investments & Dividends', type: 'income', icon: 'TrendingUp', color: '#84CC16', isDefault: true },
  { name: 'Rental Income', type: 'income', icon: 'Key', color: '#14B8A6', isDefault: true },
  { name: 'Gifts & Rewards', type: 'income', icon: 'Gift', color: '#A855F7', isDefault: true }
];

// Mongoose Schema Definition
const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Category type is required'],
      enum: ['income', 'expense'],
      default: 'expense'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null indicates global/system default category
    },
    icon: {
      type: String,
      default: 'Tag'
    },
    color: {
      type: String,
      default: '#64748B'
    },
    budgetLimit: {
      type: Number,
      default: 0
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Fallback Model Class
class CategoryModel {
  constructor({ id, name, type = 'expense', userId = null, icon = 'Tag', color = '#64748B', budgetLimit = 0, isDefault = false }) {
    this.id = id;
    this.name = name;
    this.type = type; // 'income' | 'expense'
    this.userId = userId; // null for default, string for user custom category
    this.icon = icon;
    this.color = color;
    this.budgetLimit = budgetLimit;
    this.isDefault = isDefault;
  }
}

let Category;
try {
  Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
} catch (e) {
  Category = CategoryModel;
}

module.exports = {
  Category,
  CategorySchema,
  CategoryModel,
  DEFAULT_CATEGORIES
};
