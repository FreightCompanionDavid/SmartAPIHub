const axios = require('axios');
const { ApplicationError, InternalServerError, ApiError } = require('./middleware/customErrors');
const logger = require('./logger');
const apiKey = process.env.OPENAI_API_KEY;

const openai = {
    baseURL: 'https://api.openai.com/v1/',
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    },

    /**
     * Performs an API call to the specified OpenAI endpoint.
     * @param {string} path The endpoint path.
     * @param {Object} data The data to be sent in the API request.
     * @param {number} retries The number of retry attempts.
     * @returns {Promise<Object>} The data received in response to the API call.
     */
    async apiCall(path, data, retries = 3) {
        this.analyzeAndAdjustStrategy();
        let attempt = 0;
        while (attempt < retries) {
            try {
                logger.log(`Making API call to ${path}`, data); // Log the attempt
                const response = await axios.post(`${this.baseURL}${path}`, data, { headers: this.headers });
                logger.log(`Received response from ${path}`, response.data); // Log the response
                return response.data;
            } catch (error) {
                logger.error(`Error on attempt ${attempt} calling API ${path}: ${error.response?.data?.error || error.message}`, { path, data, attempt });
                const { delay, retries: adjustedRetries } = this.adjustRetryStrategy(error);

                if (attempt >= adjustedRetries - 1) {
                    throw new ApiError(`Failed API call to ${path}: ${error.response?.data?.error || error.message}`);
                }
                attempt++;
                await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
            }
        }
    },

    /**
     * Creates an image based on the provided model, prompt, and number of images.
     * @param {Object} params The parameters for image creation.
     * @returns {Promise<Object>} The image creation result.
     */
    async createImage({ model, prompt, n }) {
        return this.apiCall('images/generate', { model, prompt, n });
    },

    /**
     * Generates completions based on the provided model, prompt, attachments, temperature, and max tokens.
     * @param {Object} params The parameters for generating completions.
     * @returns {Promise<Object>} The completion result.
     */
    async createCompletion({ model, prompt, attachments, temperature, max_tokens }) {
        return this.apiCall('completions', { model, prompt, attachments, temperature, max_tokens });
    },

    /**
     * Generates embeddings based on the provided model and input text.
     * @param {Object} params The parameters for generating embeddings.
     * @returns {Promise<Object>} The embedding result.
     */
    async createEmbedding({ model, input }) {
        return this.apiCall('embeddings', { model, input });
    },

    /**
     * Analyzes outcomes of API calls and adjusts retry strategy accordingly.
     * This is a placeholder for potential future implementations.
     */
    analyzeAndAdjustStrategy() {
        logger.log('Analyzing API call outcomes and adjusting strategy...');
    },

    /**
     * Adjusts the retry strategy based on the nature of the error encountered during an API call.
     * @param {Object} error The error encountered.
     * @returns {Object} The adjusted delay and retries count.
     */
    adjustRetryStrategy(error) {
        const isRateLimitError = error.response && error.response.status === 429;
        const isServerError = error.response && error.response.status >= 500;

        if (isRateLimitError) {
            return { delay: 60 * 1000, retries: 1 }; // Longer delay for rate limit errors
        } else if (isServerError) {
            return { delay: 30 * 1000, retries: 2 }; // Moderate delay for server errors
        } else {
            return { delay: 1000, retries: 3 }; // Default retry strategy for other errors
        }
    }
};

module.exports = openai;
