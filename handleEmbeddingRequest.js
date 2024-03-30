const openai = require('../openai-api');
const logger = require('../logger');
const { verifyToken } = require('./auth'); // Importing auth middleware

/**
 * Handles requests for generating text embeddings.
 * This version integrates progress tracking and uses async/await for middleware.
 * @param {Object} req The request object from Express.js.
 * @param {Object} res The response object from Express.js.
 * @param {Object} progress An object to track the progress of the request.
 * @param {string} [model="text-embedding-3-large"] The model to use for generating embeddings.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function handleEmbeddingRequest(req, res, requestProgress, model = "text-embedding-3-large") {
    try {
        // Authenticate the request asynchronously using JWT
        // This ensures that only authenticated requests proceed
        await new Promise((resolve, reject) => {
            verifyToken(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        requestProgress.progress = 10; // Mark 10% progress after successful authentication

        const text = req.body.text;
        // Validate the text parameter to ensure it meets the requirements for processing
        if (!text || typeof text !== 'string' || text.length < 10) {
            logger.error('Validation Error: The text parameter must be a non-empty string and at least 10 characters long.', { text });
            res.status(400).send({ message: 'Validation Error: The text parameter must be a non-empty string and at least 10 characters long.' });
            return;
        }

        requestProgress.progress = 30; // Update progress to 30% before sending the request to OpenAI

        // Request OpenAI to generate text embeddings for the given text
        // This involves sending the text to the OpenAI API and receiving the embeddings in response
        const response = await openai.createEmbedding({
            model,
            input: text,
        });

        requestProgress.progress = 100; // Mark completion of the process by setting progress to 100%

        // Successfully return the generated text embeddings to the client
        res.status(200).send({ success: true, embedding: response.data });
    } catch (error) {
        requestProgress.progress = 100; // Ensure progress reflects completion even in case of an error
        logger.error({message: "Failed to generate text embeddings due to an error", error: error.message, text, model});

        // Inform the client of the failure to process their request
        res.status(500).send({ message: "Failed to generate text embeddings. Please ensure your request is properly authenticated and the text parameter meets the required criteria." });
    }
}

module.exports = handleEmbeddingRequest;