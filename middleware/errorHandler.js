const logger = require('../logger');
const feedbackManager = require('./feedbackManager');
const { ApplicationError } = require('./customErrors');

// Centralized error handler for SmartAPIHub. It logs errors and sends user-friendly error messages to the client.
function errorHandler(err, req, res, next) {
    // Log the error
    logger.error(`${err.name}: ${err.message} (Status code: ${err.statusCode})`);

    // Gather feedback on error
    feedbackManager.gatherFeedback(`Error handled: ${err.message}`);

    // Check if the error is an instance of ApplicationError (or subclasses thereof)
    if (err instanceof ApplicationError) {
        // Handle known application errors (operational)
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    } else {
        // Handle unknown or non-operational errors
        // Log detailed error information for non-operational errors
        logger.error(`Non-operational error: ${err.stack}`);
        if (process.env.NODE_ENV === 'development') {
            res.status(500).json({
                success: false,
                message: `An unexpected error occurred. Please try again later. Error: ${err.message}`,
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'An unexpected error occurred. Please try again later.',
            });
        }
    }
}

module.exports = errorHandler;