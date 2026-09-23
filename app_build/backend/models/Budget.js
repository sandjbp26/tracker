/**
 * Budget Database Model & Schema
 * Represents monthly budget allocations per user and category.
 */

const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    categoryId: {
      type: String, // 'overall' or specific Category ObjectId string
      required: [true, 'Category identifier is required'],
      default: 'overall'
    },
    month: {
      type: Number, // 1 - 12
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number, // e.g. 2026
      required: true
    },
    limitAmount: {
      type: Number,
      required: [true, 'Budget limit amount is required'],
      min: [0, 'Limit cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

BudgetSchema.index({ userId: 1, year: 1, month: 1, categoryId: 1 }, { unique: true });

class BudgetModel {
  constructor({ id, userId, categoryId = 'overall', month, year, limitAmount, createdAt = new Date().toISOString() }) {
    this.id = id;
    this.userId = userId;
    this.categoryId = categoryId;
    this.month = month;
    this.year = year;
    this.limitAmount = Number(limitAmount);
    this.createdAt = createdAt;
  }
}

let Budget;
try {
  Budget = mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);
} catch (e) {
  Budget = BudgetModel;
}

module.exports = {
  Budget,
  BudgetSchema,
  BudgetModel
};
