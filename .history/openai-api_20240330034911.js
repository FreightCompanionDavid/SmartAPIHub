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
    async createCompletion({ model, prompt, attachments, temperature, max_tokens }) {
        try {
            const response = await axios.post(`${this.baseURL}completions`, {
                model: model,
                prompt: prompt,
                attachments: attachments,
                temperature: temperature,
                max_tokens: max_tokens,
            }, {
                headers: this.headers,
            });

            return response.data;
        } catch (error) {
            console.error(`Error creating completion: ${error.response?.data?.error || error.message}`);
            throw new Error("A more descriptive error based on the context.");
        }
    },

    async createEmbedding({ model, input }) {
        try {
            const response = await axios.post(`${this.baseURL}embeddings`, {
                model: model,
                input: input,
            }, {
                headers: this.headers,
            });

            return response.data;
        } catch (error) {
            console.error(`Error creating embedding: ${error.response?.data?.error || error.message}`);
            throw new Error("A more descriptive error based on the context.");
        }
    },
};

module.exports = openai;
