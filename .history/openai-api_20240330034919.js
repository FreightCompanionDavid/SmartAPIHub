const axios = require('axios');
const apiKey = process.env.OPENAI_API_KEY;

const openai = {
    baseURL: 'https://api.openai.com/v1/',
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
    },

    async apiCall(path, data) {
        try {
            const response = await axios.post(`${this.baseURL}${path}`, data, {
                headers: this.headers,
            });
            return response.data;
        } catch (error) {
            console.error(`Error calling API: ${error.response?.data?.error || error.message}`);
            throw new Error("A more descriptive error based on the context.");
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
};

module.exports = openai;

