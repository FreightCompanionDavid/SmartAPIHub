const logger = require('../logger');
const { ApplicationError, ValidationError, NotFoundError, InternalServerError } = require('./customErrors');

function errorHandler(err, req, res, next) {
    logger.error(`${err.name}: ${err.message} (Status code: ${err.statusCode})`);

    if (err instanceof ApplicationError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    } else {
        // Log detailed error information for non-operational errors
        logger.error(`Non-operational error: ${err.stack}`);
        res.status(500).json({
            success: false,
            message: 'An unexpected error occurred. Please try again later.',
        });
    }
}

module.exports = errorHandler;
