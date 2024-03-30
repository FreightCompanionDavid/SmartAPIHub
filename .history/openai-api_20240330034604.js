const axios = require('axios');
const apiKey = process.env.OPENAI_API_KEY;

const openai = {
  baseURL: 'https://api.openai.com/v1/',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },

  async createImage({ model, prompt, n }) {
    try {
      const response = await axios.post(`${this.baseURL}images/generate`, {
        model: model,
        prompt: prompt,
        n: n,
      }, {
        headers: this.headers,
      });

      return response.data;
    } catch (error) {
      console.error('Error creating image:', error);
      throw error;
    }
  },

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
      console.error('Error creating completion:', error);
      throw error;
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
      console.error('Error creating embedding:', error);
      throw error;
    }
  },
};

module.exports = openai;
