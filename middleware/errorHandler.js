const logger = require('../logger');
const feedbackManager = require('./feedbackManager');
const { ApplicationError, ApiError } = require('./customErrors');

/**
 * Centralized error handler that distinguishes between operational and non-operational errors,
 * logs errors for internal review, gathers feedback for continuous improvement,
 * and communicates appropriate messages to the client.
 */
function errorHandler(err, req, res, next) {
    // Log the error with detailed information for internal review
    logger.error(`${err.name}: ${err.message} (Status code: ${err.statusCode})`, {
        error: err,
        context: { url: req.url, method: req.method }
    });

    // Gather feedback on the error to aid in future improvements
    feedbackManager.gatherFeedback(`Error encountered: ${err.message}`, {
        type: err.name,
        statusCode: err.statusCode
    });

    if (err instanceof ApiError) {
        // Specifically handle API-related errors with clear, actionable advice for the client
        res.status(err.statusCode).json({
            success: false,
            message: `API Error: ${err.message}. Please review the request or contact support if the issue persists.`,
        });
    } else if (err instanceof ApplicationError) {
        // Handle application errors gracefully, providing a message that aids in understanding the issue
        res.status(err.statusCode).json({
            success: false,
            message: `Application Error: ${err.message}. Efforts are underway to resolve this issue.`,
        });
    } else {
        // Handle all other errors as non-operational, logging detailed information for internal debugging
        // and providing a generic message to the client for security reasons
        logger.error(`Unexpected error: ${err.stack}`, {
            context: { body: req.body, query: req.query }
        });

        const responseMessage = process.env.NODE_ENV === 'development' ?
            `Unexpected error occurred: ${err.message}. Debugging information provided for development mode.` :
            'An unexpected error occurred. We apologize for the inconvenience. Please try again later.';
        
        res.status(500).json({
            success: false,
            message: responseMessage,
        });
    }
}

module.exports = errorHandler;