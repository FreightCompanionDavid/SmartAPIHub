const openai = require('./openai-api');
const logger = require('./logger'); // Assuming logger.js setup is done
const { verifyToken } = require('./middleware/auth'); // Importing auth middleware

/**
 * Handles requests for generating text embeddings.
 * This version integrates progress tracking and uses async/await for middleware.
 * @param {Object} req The request object from Express.js.
 * @param {Object} res The response object from Express.js.
 * @param {Object} progress An object to track the progress of the request.
 * @param {string} [model="text-embedding-3-large"] The model to use for generating embeddings.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function handleEmbeddingRequest(req, res, progress, model = "text-embedding-3-large") {
    try {
        // Authenticate the request asynchronously
        await new Promise((resolve, reject) => {
            verifyToken(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        progress.progress = 10; // Update progress after successful authentication

        const text = req.body.text;
        // Validate the text parameter
        if (!text || typeof text !== 'string' || text.length < 10) {
            logger.error('Validation Error: The text parameter must be a non-empty string and at least 10 characters long.', { text });
            res.status(400).send({ message: 'Validation Error: The text parameter must be a non-empty string and at least 10 characters long.' });
            return;
        }

        progress.progress = 30; // Progress update before sending the request to OpenAI

        // Generate text embeddings using the specified model
        const response = await openai.createEmbedding({
            model,
            input: text,
        });

        progress.progress = 100; // Final progress update after receiving the response

        // Send the successful response back to the client
        res.status(200).send({ success: true, embedding: response.data });
    } catch (error) {
        progress.progress = 100; // Ensure progress is updated in case of an error
        logger.error({message: "Failed to generate text embeddings due to an error", error: error.message, text, model});

        // Respond with an error message
        res.status(500).send({ message: "Failed to generate text embeddings. Please ensure your request is properly authenticated and the text parameter meets the required criteria." });
    }
}

module.exports = handleEmbeddingRequest;