const openai = require('./openai-api');
const logger = require('./logger'); // Assuming logger.js setup is done

/**
 * Handles requests for generating text embeddings.
 * @param {string} text The text to generate embeddings for.
 * @param {string} model The model to use for generating embeddings. Defaults to "text-embedding-3-large".
 * @returns {Promise<Object>} The embedding result.
 */
async function handleEmbeddingRequest(text, model = "text-embedding-3-large") {
    try {
        const response = await openai.createEmbedding({
            model: model,
            input: text,
        });

        return { success: true, embedding: response.data };
    } catch (error) {
        logger.error("Error in generating text embeddings:", { error: error.message, text, model });
        throw new Error("Failed to generate embedding.");
    }
}

module.exports = handleEmbeddingRequest;
