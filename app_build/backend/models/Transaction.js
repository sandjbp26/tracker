/**
 * Transaction Database Model & Schema
 * Represents financial income & expense transactions linked to a specific user and category.
 */

const mongoose = require('mongoose');

// Mongoose Schema Definition
const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Transaction title is required'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [0.01, 'Amount must be greater than zero']
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: ['income', 'expense'],
      default: 'expense',
      index: true
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now,
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank_transfer', 'other'],
      default: 'card'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for high performance user query filtering
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1, date: -1 });
TransactionSchema.index({ userId: 1, categoryId: 1 });

// Fallback Model Class
class TransactionModel {
  constructor({
    id,
    userId,
    categoryId,
    title,
    amount,
    type = 'expense',
    date = new Date().toISOString(),
    paymentMethod = 'card',
    notes = '',
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    this.id = id;
    this.userId = userId;
    this.categoryId = categoryId;
    this.title = title;
    this.amount = Number(amount);
    this.type = type; // 'income' | 'expense'
    this.date = typeof date === 'string' ? date : new Date(date).toISOString();
    this.paymentMethod = paymentMethod;
    this.notes = notes;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

let Transaction;
try {
  Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
} catch (e) {
  Transaction = TransactionModel;
}

module.exports = {
  Transaction,
  TransactionSchema,
  TransactionModel
};
