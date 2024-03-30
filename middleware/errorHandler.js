const logger = require('../logger');

function errorHandler(err, req, res, next) {
    logger.error(err);

    if (err.isOperational) {
        res.status(err.statusCode || 400).json({
            success: false,
            message: err.message,
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'An unexpected error occurred. Please try again later.',
        });
    }
}

module.exports = errorHandler;
