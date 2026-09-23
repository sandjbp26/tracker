/**
 * Database Models Barrel Export
 */

const { User, UserSchema, UserModel } = require('./User');
const { Category, CategorySchema, CategoryModel, DEFAULT_CATEGORIES } = require('./Category');
const { Transaction, TransactionSchema, TransactionModel } = require('./Transaction');
const { Budget, BudgetSchema, BudgetModel } = require('./Budget');

module.exports = {
  User,
  UserSchema,
  UserModel,
  Category,
  CategorySchema,
  CategoryModel,
  DEFAULT_CATEGORIES,
  Transaction,
  TransactionSchema,
  TransactionModel,
  Budget,
  BudgetSchema,
  BudgetModel
};
