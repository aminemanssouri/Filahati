/**
 * Custom error classes for the Filahati application
 * Provides structured error handling with appropriate status codes
 */

/**
 * Base error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * For validation errors (400 Bad Request)
 */
class ValidationError extends AppError {
  constructor(message, errorCode = 'VALIDATION_ERROR') {
    super(message, 400, errorCode);
    this.name = 'ValidationError';
  }
}

/**
 * For authentication errors (401 Unauthorized)
 */
class AuthenticationError extends AppError {
  constructor(message, errorCode = 'AUTHENTICATION_ERROR') {
    super(message, 401, errorCode);
    this.name = 'AuthenticationError';
  }
}

/**
 * For authorization errors (403 Forbidden)
 */
class AuthorizationError extends AppError {
  constructor(message, errorCode = 'AUTHORIZATION_ERROR') {
    super(message, 403, errorCode);
    this.name = 'AuthorizationError';
  }
}

/**
 * For not found errors (404 Not Found)
 */
class NotFoundError extends AppError {
  constructor(message, errorCode = 'NOT_FOUND') {
    super(message, 404, errorCode);
    this.name = 'NotFoundError';
  }
}

/**
 * For conflict errors (409 Conflict)
 */
class ConflictError extends AppError {
  constructor(message, errorCode = 'CONFLICT') {
    super(message, 409, errorCode);
    this.name = 'ConflictError';
  }
}

/**
 * For server errors (500 Internal Server Error)
 */
class ServerError extends AppError {
  constructor(message, errorCode = 'SERVER_ERROR') {
    super(message, 500, errorCode);
    this.name = 'ServerError';
    this.isOperational = false;
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  ServerError
};
