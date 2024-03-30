const logger = require('../logger');
const feedbackManager = require('./feedbackManager');

function errorHandler(err, req, res, next) {
    logger.error(err);

    // Gather feedback on error
    feedbackManager.gatherFeedback(`Error handled: ${err.message}`);

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
