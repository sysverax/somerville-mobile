/**
 * Custom error class for handling application errors.
 * @class AppError
 * @extends Error
 *
 * @param {number} statusCode - HTTP status code for the error.
 * @param {string} message - Error message.
 * @param {string} [detail] - Additional details about the error.
 * @param {string} [solution] - Suggested solution for the error.
 * @example
 * const error = new AppError(404, 'Resource not found', 'The requested resource does not exist.', 'Check the resource ID and try again.');
 * throw error;
 * @throws {AppError} Throws an instance of AppError with the provided parameters.
 * @returns {AppError} Returns an instance of AppError with the specified status code, message, detail, and solution.
 * @description
 * This class extends the built-in Error class to provide a structured way to handle errors in the application.
 * It includes properties for status code, message, detail, and solution, making it easier to manage and respond to errors.
 */
class AppError extends Error {
  constructor(statusCode, message, detail, solution) {
    super(message);
    this.statusCode = statusCode;
    this.detail = detail;
    this.solution = solution;

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Represents an HTTP 400 Bad Request error.
 * Typically thrown when the client sends malformed or invalid data.
 *
 * @class BadRequestError
 * @extends {AppError}
 *
 * @param {string} message - A short, human-readable summary of the error.
 * @param {string} [detail] - Optional technical details about the error.
 * @param {string} [solution] - Optional suggested solution or next steps.
 *
 * @example
 * throw new BadRequestError(
 *   'Invalid email format',
 *   'The "email" field must be a valid email address.',
 *   'Check the submitted form and correct the email address.'
 * );
 */
class BadRequestError extends AppError {
  constructor(message, detail, solution) {
    super(400, message, detail, solution);
  }
}

/**
 * Represents an HTTP 401 Unauthorized error.
 * Typically thrown when authentication is required and has failed or has not yet been provided.
 *
 * @class UnauthorizedError
 * @extends {AppError}
 * @param {string} message - A short, human-readable summary of the error.
 * @param {string} [detail] - Optional technical details about the error.
 * @param {string} [solution] - Optional suggested solution or next steps.
 * @example
 * throw new UnauthorizedError(
 *   'Access denied',
 *   'User is not authenticated.',
 *   'Please log in and try again.'
 * );
 */
class UnauthorizedError extends AppError {
  constructor(message, detail, solution) {
    super(401, message, detail, solution);
  }
}

/**
 * Represents an HTTP 403 Forbidden error.
 * Typically thrown when the server understands the request but refuses to authorize it.
 * @class ForbiddenError
 * @extends {AppError}
 * @param {string} message - A short, human-readable summary of the error.
 * @param {string} [detail] - Optional technical details about the error.
 * @param {string} [solution] - Optional suggested solution or next steps.
 * @example
 * throw new ForbiddenError(
 *   'Access denied',
 *   'User does not have permission to access this resource.',
 *   'Contact the administrator for access.'
 * );
 */
class ForbiddenError extends AppError {
  constructor(message, detail, solution) {
    super(403, message, detail, solution);
  }
}

/**
 * Represents an HTTP 404 Not Found error.
 * Typically thrown when the requested resource could not be found on the server.
 * @class NotFoundError
 * @extends {AppError}
 * @param {string} message - A short, human-readable summary of the error.
 * @param {string} [detail] - Optional technical details about the error.
 * @param {string} [solution] - Optional suggested solution or next steps.
 * @example
 *  throw new NotFoundError(
 *    'Resource not found',
 *    'The requested resource could not be found on the server.',
 *    'Check the resource ID and try again.'
 *  );
 */
class NotFoundError extends AppError {
  constructor(message, detail, solution) {
    super(404, message, detail, solution);
  }
}

/**
 * Represents an HTTP 405 Method Not Allowed error.
 * Typically thrown when the requested method is not supported for the resource.
 * @class MethodNotAllowedError
 * @extends {AppError}
 * @param {string} message - A short, human-readable summary of the error.
 * @param {string} [detail] - Optional technical details about the error.
 * @param {string} [solution] - Optional suggested solution or next steps.
 * @example
 * throw new MethodNotAllowedError(
 *  'Method not allowed',
 *  'The requested method is not supported for this resource.',
 *  'Check the API documentation for allowed methods.'
 * );
 */
class MethodNotAllowedError extends AppError {
  constructor(message, detail, solution) {
    super(405, message, detail, solution);
  }
}

/**
 * Represents an HTTP 409 Conflict error.
 * Typically thrown when a request conflicts with the current state of the server.
 * @class ConflictError
 * @extends {AppError}
 * @param {string} message - A short, human-readable summary of the error.
 * @param {string} [detail] - Optional technical details about the error.
 * @param {string} [solution] - Optional suggested solution or next steps.
 * @example
 * throw new ConflictError(
 *   'Resource conflict',
 *   'The requested resource is in use.',
 *   'Please try again later.'
 * );
 */
class ConflictError extends AppError {
  constructor(message, detail, solution) {
    super(409, message, detail, solution);
  }
}

/**
 * Represents an HTTP 429 Too Many Requests error.
 * Typically thrown when the user has sent too many requests in a given amount of time.
 * @class RateLimitError
 * @extends {AppError}
 * @param {string} message - A short, human-readable summary of the error.
 * @param {string} [detail] - Optional technical details about the error.
 * @param {string} [solution] - Optional suggested solution or next steps.
 * @example
 * throw new RateLimitError(
 *   'Too many requests',
 *   'The user has sent too many requests in a short period of time.',
 *   'Please try again later.'
 * );
 */
class RateLimitError extends AppError {
  constructor(message, detail, solution) {
    super(429, message, detail, solution);
  }
}

/**
 * Represents an HTTP 500 Internal Server Error.
 * Typically thrown when an unexpected condition was encountered on the server.
 * @class InternalServerError
 * @extends {AppError}
 * @param {string} message - A short, human-readable summary of the error.
 * @param {string} [detail] - Optional technical details about the error.
 * @param {string} [solution] - Optional suggested solution or next steps.
 * @example
 * throw new InternalServerError(
 *   'Internal server error',
 *   'An unexpected error occurred on the server.',
 *   'Please try again later.'
 * );
 */
class InternalServerError extends AppError {
  constructor(message, detail, solution) {
    super(500, message, detail, solution);
  }
}

/**
 * Represents an HTTP 503 Service Unavailable error.
 * Typically thrown when the server is currently unable to handle the request due to temporary overload or maintenance.
 * @class ServiceUnavailableError
 * @extends {AppError}
 * @param {string} message - A short, human-readable summary of the error.
 * @param {string} [detail] - Optional technical details about the error.
 * @param {string} [solution] - Optional suggested solution or next steps.
 * @example
 * throw new ServiceUnavailableError(
 *   'Service unavailable',
 *   'The server is currently unable to handle the request.',
 *   'Please try again later.'
 * );
 */
class ServiceUnavailableError extends AppError {
  constructor(message, detail, solution) {
    super(503, message, detail, solution);
  }
}

/**
 * Exports all custom error classes for use in the application.
 * This allows for consistent error handling across different parts of the application.
 *
 * @module ErrorUtils
 */
module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  MethodNotAllowedError,
  ConflictError,
  RateLimitError,
  InternalServerError,
  ServiceUnavailableError,
};
