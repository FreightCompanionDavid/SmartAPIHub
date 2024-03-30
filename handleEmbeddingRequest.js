const openai = require('./openai-api');
const logger = require('./logger'); // Assuming logger.js setup is done
const { verifyToken } = require('./middleware/auth'); // Importing auth middleware

/**
 * Handles requests for generating text embeddings.
 * @param {string} text The text to generate embeddings for.
 * @param {string} model The model to use for generating embeddings. Defaults to "text-embedding-3-large".
 * @returns {Promise<Object>} The embedding result.
 */
async function handleEmbeddingRequest(req, res, model = "text-embedding-3-large") {
    // Refactored to use async/await for verifyToken middleware
    await new Promise((resolve, reject) => {
        verifyToken(req, res, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
    const text = req.body.text;
    // Input validation for text parameter
    if (!text || typeof text !== 'string' || text.length < 10) {
        logger.error('Validation Error: The text parameter must be a non-empty string and at least 10 characters long.', { text });
        return res.status(400).send({ message: 'Validation Error: The text parameter must be a non-empty string and at least 10 characters long.' });
    }
    try {
        const response = await openai.createEmbedding({
            model: model,
            input: text,
        });

        return { success: true, embedding: response.data };
    } catch (error) {
        logger.error("Failed to generate text embeddings due to an error:", { error: error.message, text, model });
        throw new Error("Failed to generate text embeddings. Please ensure your request is properly authenticated and the text parameter meets the required criteria.");
    }
}

module.exports = handleEmbeddingRequest;
