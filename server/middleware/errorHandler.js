/**
 * Global Error Handler Middleware for MoMech
 * Centralized error handling with logging and appropriate responses
 */

const logger = require('../utils/logger');
const config = require('../../config/app');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, code = null, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error class
 */
class ValidationError extends ApiError {
  constructor(message, errors = []) {
    super(message, 422, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

/**
 * Authentication error class
 */
class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Authorization error class
 */
class AuthorizationError extends ApiError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Not found error class
 */
class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

/**
 * Database error class
 */
class DatabaseError extends ApiError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

/**
 * Format error response
 */
function formatErrorResponse(error, req) {
  const response = {
    error: {
      message: error.message,
      code: error.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    }
  };

  // Add additional details for specific error types
  if (error instanceof ValidationError && error.errors.length > 0) {
    response.error.details = error.errors;
  }

  // Add stack trace in development
  if (config.ENVIRONMENT === 'development' && config.DEBUG) {
    response.error.stack = error.stack;
    
    if (error.originalError) {
      response.error.originalError = {
        message: error.originalError.message,
        stack: error.originalError.stack
      };
    }
  }

  // Add request ID if available
  if (req.id) {
    response.error.requestId = req.id;
  }

  return response;
}

/**
 * Log error with appropriate level
 */
function logError(error, req, res) {
  const logContext = {
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    },
    response: {
      statusCode: error.statusCode || 500
    }
  };

  // Don't log sensitive information
  if (logContext.request.headers.authorization) {
    logContext.request.headers.authorization = '[REDACTED]';
  }

  if (logContext.request.body && logContext.request.body.password) {
    logContext.request.body.password = '[REDACTED]';
  }

  // Log with appropriate level
  if (error.statusCode >= 500) {
    logger.error('Server Error', logContext);
  } else if (error.statusCode >= 400) {
    logger.warn('Client Error', logContext);
  } else {
    logger.info('Request Error', logContext);
  }
}

/**
 * Handle SQLite database errors
 */
function handleDatabaseError(error) {
  if (error.code) {
    switch (error.code) {
      case 'SQLITE_CONSTRAINT_UNIQUE':
        return new ValidationError('Duplicate entry', [{
          field: 'unknown',
          message: 'This value already exists'
        }]);
      
      case 'SQLITE_CONSTRAINT_FOREIGNKEY':
        return new ValidationError('Invalid reference', [{
          field: 'unknown',
          message: 'Referenced record does not exist'
        }]);
      
      case 'SQLITE_CONSTRAINT_NOTNULL':
        return new ValidationError('Missing required field', [{
          field: 'unknown',
          message: 'This field is required'
        }]);
      
      case 'SQLITE_BUSY':
        return new ApiError('Database is busy, please try again', 503, 'DATABASE_BUSY');
      
      case 'SQLITE_LOCKED':
        return new ApiError('Database is locked, please try again', 503, 'DATABASE_LOCKED');
      
      default:
        return new DatabaseError('Database operation failed', error);
    }
  }
  
  return new DatabaseError('Database operation failed', error);
}

/**
 * Handle JSON parsing errors
 */
function handleJsonError(error) {
  return new ValidationError('Invalid JSON format', [{
    field: 'body',
    message: 'Request body contains invalid JSON'
  }]);
}

/**
 * Main error handler middleware
 */
function errorHandler(error, req, res, next) {
  // If response was already sent, delegate to Express default error handler
  if (res.headersSent) {
    return next(error);
  }

  let processedError = error;

  // Convert known error types
  if (error.name === 'SyntaxError' && error.type === 'entity.parse.failed') {
    processedError = handleJsonError(error);
  } else if (error.code && error.code.startsWith('SQLITE_')) {
    processedError = handleDatabaseError(error);
  } else if (!(error instanceof ApiError)) {
    // Convert unknown errors to ApiError
    processedError = new ApiError(
      config.ENVIRONMENT === 'production' ? 'Internal server error' : error.message,
      500,
      'INTERNAL_ERROR'
    );
    processedError.originalError = error;
  }

  // Log the error
  logError(processedError, req, res);

  // Send error response
  const statusCode = processedError.statusCode || 500;
  const errorResponse = formatErrorResponse(processedError, req);

  res.status(statusCode).json(errorResponse);
}

/**
 * 404 handler for undefined routes
 */
function notFoundHandler(req, res, next) {
  const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
  next(error);
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch promise rejections
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create error with specific status code
 */
function createError(message, statusCode = 500, code = null) {
  return new ApiError(message, statusCode, code);
}

module.exports = {
  // Error classes
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  
  // Middleware functions
  errorHandler,
  notFoundHandler,
  asyncHandler,
  
  // Utility functions
  createError,
  formatErrorResponse,
  logError
};
