const logger = require('../logger');
const feedbackManager = require('./feedbackManager');
const { ApplicationError, ApiError } = require('./customErrors');

// This function handles errors that occur during API operations. It distinguishes between operational errors (expected errors that are handled gracefully) and non-operational errors (unexpected errors that indicate a problem in the code).
function errorHandler(err, req, res, next) {
    // Log the error for internal tracking
    logger.error(`${err.name}: ${err.message} (Status code: ${err.statusCode})`);

    // Gather feedback on the error to improve future error handling
    feedbackManager.gatherFeedback(`Error handled: ${err.message}`);

    // Initial check to determine if the error is operational (expected) or non-operational (unexpected)
    if (err instanceof ApiError) {
        // Specifically handles errors related to API operations, providing a clear and actionable message to the client.
        res.status(err.statusCode).json({
            success: false,
            message: `API Error: ${err.message}. Please check the documentation or contact support if the problem persists.`,
        });
    } else if (err instanceof ApplicationError) {
        // Handles known application errors, ensuring that the client receives a specific message that can help in understanding the issue.
        res.status(err.statusCode).json({
            success: false,
            message: `Application Error: ${err.message}. We are working to resolve this issue.`,
        });
    } else {
        // This block handles unknown or non-operational errors. Such errors are logged with detailed information for internal review and debugging.
        // Clients are provided with a generic message to ensure that sensitive details are not exposed.
        logger.error(`Non-operational error: ${err.stack}`);
        res.status(500).json({
            success: false,
            message: 'An unexpected error occurred. We apologize for the inconvenience. Please try again later or contact support.',
        });
    }
}

module.exports = errorHandler;