// Base class for all application-specific errors
// It includes common properties like statusCode and isOperational to distinguish between operational errors (expected) and programming errors (unexpected)
class ApplicationError extends Error {
    constructor(message, statusCode, isOperational) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Represents an error when validation fails (e.g., missing or invalid parameters)
// This typically results in a 400 Bad Request response
class ValidationError extends ApplicationError {
    constructor(message) {
        super(message, 400, true);
    }
}

// Represents an error when a requested resource is not found
// This typically results in a 404 Not Found response
class NotFoundError extends ApplicationError {
    constructor(message) {
        super(message, 404, true);
    }
}

// Represents an error when an unexpected condition was encountered on the server
// This typically results in a 500 Internal Server Error response
class InternalServerError extends ApplicationError {
    constructor(message) {
        super(message, 500, false);
    }
}

// Represents a generic error related to the API's operation
// The statusCode can be customized, defaulting to 503 Service Unavailable
class ApiError extends ApplicationError {
    constructor(message, statusCode = 503, isOperational = true) {
        super(message, statusCode, isOperational);
        this.name = this.constructor.name;
    }
}

module.exports = {
    ApplicationError,
    ValidationError,
    NotFoundError,
    InternalServerError,
    ApiError,
};
