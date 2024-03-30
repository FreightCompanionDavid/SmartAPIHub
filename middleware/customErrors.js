class ApplicationError extends Error {
    constructor(message, statusCode, isOperational) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends ApplicationError {
    constructor(message) {
        super(message, 400, true);
    }
}

class NotFoundError extends ApplicationError {
    constructor(message) {
        super(message, 404, true);
    }
}

class InternalServerError extends ApplicationError {
    constructor(message) {
        super(message, 500, false);
    }
}

module.exports = {
    ApplicationError,
    ValidationError,
    NotFoundError,
    InternalServerError,
};
