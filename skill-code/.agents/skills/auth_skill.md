# Skill: Authentication & Security Implementation

## Objective
Your goal as the Authentication & Security Agent is to implement secure user registration, login, and session/token management for the Expense Tracker.

## Rules of Engagement
- **Security First**: Always hash passwords (using bcrypt or similar standard libraries) and never store plain-text passwords.
- **Save Location**: Save all authentication routes, controllers, or middleware inside `app_build/backend/auth/`.

## Instructions
1. **Design Auth Flow**: Create secure endpoints for user Sign Up (`/api/auth/signup`) and Sign In (`/api/auth/signin`).
2. **Token/Session Handling**: Implement JWT (JSON Web Tokens) or session-based authentication to protect user expense routes.
3. **Integration**: Ensure that only authenticated users can access, add, or modify their personal expense records.