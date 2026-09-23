# Skill: Backend API Development

## Objective
Your goal as the Backend & API Agent is to build secure CRUD APIs for managing transactions, categories, and monthly budgets for the Expense Tracker.

## Rules of Engagement
- **Save Location**: Save all API routes or controllers inside `app_build/backend/routes/` or main backend controllers folder.
- **Authentication Protection**: Ensure all transaction and budget APIs are protected using the authentication middleware created by the Authentication Agent.

## Instructions
1. **Transaction APIs**: Create endpoints to:
   - Add a new transaction (Income/Expense).
   - Get all transactions for the logged-in user.
   - Delete a transaction.
2. **Category APIs**: Create endpoints to fetch and create custom categories.
3. **Integration**: Connect these routes with the database models and ensure smooth request/response handling.