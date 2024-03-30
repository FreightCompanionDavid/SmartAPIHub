const logger = require('../logger');

function scheduleReflectionSessions() {
    const nextSessionDate = new Date();
    nextSessionDate.setDate(nextSessionDate.getDate() + 7); // Schedule for next week
    logger.info(`Next reflection session scheduled for: ${nextSessionDate.toISOString()}`);
}

function gatherFeedback(feedback) {
    const feedbackTimestamp = new Date().toISOString();
    logger.info(`Feedback received at ${feedbackTimestamp}: ${feedback}`);
}

module.exports = { scheduleReflectionSessions, gatherFeedback };
