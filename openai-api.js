const axios = require('axios');
const { InternalServerError } = require('./middleware/customErrors');
const apiKey = process.env.OPENAI_API_KEY;

const openai = {
    baseURL: 'https://api.openai.com/v1/',
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    },

    async apiCall(path, data, retries = 3) {
        this.analyzeAndAdjustStrategy();
        let attempt = 0;
        while (attempt < retries) {
            try {
                console.log(`Making API call to ${path} with data:`, data); // Enhanced logging for request
                const response = await axios.post(`${this.baseURL}${path}`, data, {
                    headers: this.headers,
                });
                console.log(`Received response from ${path}:`, response.data); // Enhanced logging for response
                return response.data;
            } catch (error) {
                console.error(`Error calling API: ${error.response?.data?.error || error.message}`, { path, data, attempt });
                const { delay, retries: adjustedRetries } = this.adjustRetryStrategy(error);
                if (attempt >= adjustedRetries - 1) throw new InternalServerError(`Failed API call to ${path}: ${error.response?.data?.error || error.message}`, 500, false);
                attempt++;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    },

    async createImage({ model, prompt, n }) {
        return this.apiCall('images/generate', { model, prompt, n });
    },

    async createCompletion({ model, prompt, attachments, temperature, max_tokens }) {
        return this.apiCall('completions', { model, prompt, attachments, temperature, max_tokens });
    },

    async createEmbedding({ model, input }) {
        return this.apiCall('embeddings', { model, input });
    },

    analyzeAndAdjustStrategy() {
        // Placeholder for analyzing API call outcomes
        // Adjust the retries parameter based on analysis
        console.log('Analyzing API call outcomes and adjusting strategy...');
    },

    adjustRetryStrategy(error) {
        // Analyze the error and return adjusted delay and retry count
        const isRateLimitError = error.response && error.response.status === 429;
        const isServerError = error.response && error.response.status >= 500;

        if (isRateLimitError) {
            return { delay: 60 * 1000, retries: 1 };
        } else if (isServerError) {
            return { delay: 30 * 1000, retries: 2 };
        } else {
            return { delay: 1000, retries: 3 };
        }
    }
};

module.exports = openai;
