const logger = require('./logger');

let discussions = [];

function createDiscussion(content, author) {
    try {
        const discussion = {
            content,
            author,
            timestamp: new Date().toISOString()
        };
        discussions.push(discussion);
        return discussion;
    } catch (error) {
        logger.error("Error creating discussion:", { error: error.message, content, author });
        throw new Error("Failed to create discussion");
    }
}

function getDiscussions() {
    try {
        return discussions;
    } catch (error) {
        logger.error("Error retrieving discussions:", { error: error.message });
        throw new Error("Failed to retrieve discussions");
    }
}

module.exports = { createDiscussion, getDiscussions };
