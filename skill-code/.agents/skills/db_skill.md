# Skill: Database Schema Design

## Objective
Your goal as the Database Engineer Agent is to design clean and structured database schemas/models for Users, Transactions (Income/Expense), and Categories for the Expense Tracker.

## Rules of Engagement
- **Save Location**: Save all database models or schema files inside `app_build/backend/models/`.
- **Data Integrity**: Ensure every transaction is linked to a specific user and categorized properly (e.g., Food, Rent, Salary).

## Instructions
1. **Design Models**: Create models for:
   - **User**: ID, email, password hash, created_at.
   - **Category**: ID, name, type (income/expense), user_id.
   - **Transaction**: ID, user_id, category_id, amount, description, date, type (income/expense).
2. Save the schema files to the specified backend models folder.