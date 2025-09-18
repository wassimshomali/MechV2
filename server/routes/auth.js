/**
 * Authentication Routes for MoMech
 * Handles user authentication, registration, and session management
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { asyncHandler, ValidationError, AuthenticationError } = require('../middleware/errorHandler');
const dbConnection = require('../database/connection');
const config = require('../../config/app');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    config.SECURITY.JWT_SECRET,
    { expiresIn: config.SECURITY.JWT_EXPIRES_IN }
  );
}

/**
 * Generate refresh token
 */
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    config.SECURITY.JWT_SECRET + 'refresh',
    { expiresIn: config.SECURITY.REFRESH_TOKEN_EXPIRES_IN }
  );
}

/**
 * Validate user input
 */
function validateLoginInput(email, password) {
  const errors = [];
  
  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  }
  
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }
  
  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

/**
 * User login
 * POST /api/v1/auth/login
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password, remember = false } = req.body;
  
  // Validate input
  validateLoginInput(email, password);
  
  // Find user by email
  const user = await dbConnection.get(
    'SELECT * FROM users WHERE email = ? AND is_active = 1',
    [email]
  );
  
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }
  
  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw new AuthenticationError('Invalid email or password');
  }
  
  // Update last login
  await dbConnection.run(
    'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
    [user.id]
  );
  
  // Generate tokens
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // Log successful login
  logger.auth('login', user.id, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    remember
  });
  
  // Remove password from response
  const { password_hash, ...userResponse } = user;
  
  res.json({
    user: userResponse,
    token,
    refreshToken,
    expiresIn: config.SECURITY.JWT_EXPIRES_IN
  });
}));

/**
 * User logout
 * POST /api/v1/auth/logout
 */
router.post('/logout', asyncHandler(async (req, res) => {
  // In a production app, you might want to blacklist the token
  // For now, we'll just log the logout event
  
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.SECURITY.JWT_SECRET);
      
      logger.auth('logout', decoded.id, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    } catch (error) {
      // Invalid token, but that's okay for logout
    }
  }
  
  res.json({ message: 'Logged out successfully' });
}));

/**
 * Refresh token
 * POST /api/v1/auth/refresh
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    throw new AuthenticationError('Refresh token is required');
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.SECURITY.JWT_SECRET + 'refresh');
    
    // Get user
    const user = await dbConnection.get(
      'SELECT * FROM users WHERE id = ? AND is_active = 1',
      [decoded.id]
    );
    
    if (!user) {
      throw new AuthenticationError('Invalid refresh token');
    }
    
    // Generate new tokens
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    logger.auth('token_refresh', user.id, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn: config.SECURITY.JWT_EXPIRES_IN
    });
    
  } catch (error) {
    throw new AuthenticationError('Invalid refresh token');
  }
}));

/**
 * Get current user profile
 * GET /api/v1/auth/profile
 */
router.get('/profile', asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    throw new AuthenticationError('Authorization header is required');
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, config.SECURITY.JWT_SECRET);
    
    const user = await dbConnection.get(
      'SELECT id, username, email, first_name, last_name, role, phone, is_active, last_login_at, created_at FROM users WHERE id = ? AND is_active = 1',
      [decoded.id]
    );
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    res.json(user);
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Invalid or expired token');
    }
    throw error;
  }
}));

/**
 * Register new user (admin only for now)
 * POST /api/v1/auth/register
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { 
    username, 
    email, 
    password, 
    firstName, 
    lastName, 
    role = 'mechanic',
    phone 
  } = req.body;
  
  // Validate input
  const errors = [];
  
  if (!username) errors.push({ field: 'username', message: 'Username is required' });
  if (!email) errors.push({ field: 'email', message: 'Email is required' });
  if (!password) errors.push({ field: 'password', message: 'Password is required' });
  if (!firstName) errors.push({ field: 'firstName', message: 'First name is required' });
  if (!lastName) errors.push({ field: 'lastName', message: 'Last name is required' });
  
  if (password && password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters long' });
  }
  
  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
  
  // Check if user already exists
  const existingUser = await dbConnection.get(
    'SELECT id FROM users WHERE email = ? OR username = ?',
    [email, username]
  );
  
  if (existingUser) {
    throw new ValidationError('User already exists', [
      { field: 'email', message: 'Email or username is already taken' }
    ]);
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, config.SECURITY.BCRYPT_ROUNDS);
  
  // Create user
  const result = await dbConnection.run(`
    INSERT INTO users (username, email, password_hash, first_name, last_name, role, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [username, email, passwordHash, firstName, lastName, role, phone]);
  
  // Get created user
  const newUser = await dbConnection.get(
    'SELECT id, username, email, first_name, last_name, role, phone, is_active, created_at FROM users WHERE id = ?',
    [result.lastID]
  );
  
  logger.auth('register', newUser.id, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    role
  });
  
  res.status(201).json({
    message: 'User created successfully',
    user: newUser
  });
}));

module.exports = router;
