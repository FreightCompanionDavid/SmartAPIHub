// Base class for all application-specific errors
// It includes common properties like statusCode and isOperational to distinguish between operational errors (expected) and programming errors (unexpected)
class ApplicationError extends Error {
    constructor(message, statusCode, isOperational) {
        super(message);
        this.name = this.constructor.name; // Assign the class name as the error name
        this.statusCode = statusCode; // HTTP status code appropriate for this error
        this.isOperational = isOperational; // Flag to denote if the error is operational
        Error.captureStackTrace(this, this.constructor); // Capture the stack trace
    }
}

// Represents an error when validation fails (e.g., missing or invalid parameters)
// This typically results in a 400 Bad Request response
class ValidationError extends ApplicationError {
    constructor(message) {
        super(message, 400, true); // 400 Bad Request
    }
}

// Represents an error when a requested resource is not found
// This typically results in a 404 Not Found response
class NotFoundError extends ApplicationError {
    constructor(message) {
        super(message, 404, true); // 404 Not Found
    }
}

// Represents an error when an unexpected condition was encountered on the server
// This typically results in a 500 Internal Server Error response
class InternalServerError extends ApplicationError {
    constructor(message) {
        super(message, 500, false); // 500 Internal Server Error
    }
}

// Represents a generic error related to the API's operation
// The statusCode can be customized, defaulting to 503 Service Unavailable
class ApiError extends ApplicationError {
    /**
     * Represents an error from an API call.
     * @param {string} message The error message.
     * @param {number} [statusCode=503] The HTTP status code for the error.
     * @param {boolean} [isOperational=true] Indicates if the error is operational.
     */
    constructor(message, statusCode = 503, isOperational = true) {
        super(message, statusCode, isOperational); // 503 Service Unavailable by default
    }
}

module.exports = {
    ApplicationError,
    ValidationError,
    NotFoundError,
    InternalServerError,
    ApiError,
};
