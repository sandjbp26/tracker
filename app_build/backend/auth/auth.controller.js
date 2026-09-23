/**
 * Authentication Controller
 * Handles User Signup, Login, Password Hashing (bcrypt), and JWT Token Generation.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./auth.middleware');
const { validateSignupInput, validateSigninInput } = require('./auth.validator');

// In-memory User Data Store (replaceable with MongoDB/PostgreSQL model)
const users = [];

/**
 * Helper to generate JWT Token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * POST /api/auth/signup
 * Register a new user
 */
const signup = async (req, res) => {
  try {
    const { name, email, password, defaultCurrency } = req.body;

    // 1. Validate Input
    const { isValid, errors } = validateSignupInput({ name, email, password });
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if user already exists
    const existingUser = users.find((u) => u.email === normalizedEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // 3. Hash Password (Bcrypt with 10 salt rounds)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Create User Record
    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      currency: defaultCurrency || 'INR',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // 5. Generate Auth Token
    const token = generateToken(newUser);

    // 6. Return response with sanitized user data (exclude password)
    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        currency: newUser.currency,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error occurred during registration.'
    });
  }
};

/**
 * POST /api/auth/signin
 * Authenticate existing user
 */
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate Input
    const { isValid, errors } = validateSigninInput({ email, password });
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Find User
    const user = users.find((u) => u.email === normalizedEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 3. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 4. Generate Auth Token
    const token = generateToken(user);

    // 5. Return sanitized user data
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Signin Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error occurred during login.'
    });
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user details (Protected Route)
 */
const getMe = async (req, res) => {
  try {
    const user = users.find((u) => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching user profile.'
    });
  }
};

/**
 * POST /api/auth/logout
 * Log out user session
 */
const logout = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'User logged out successfully.'
  });
};

module.exports = {
  signup,
  signin,
  getMe,
  logout,
  users // Exported for model integration / testing
};
