const axios = require('axios');
const openai = require('../openai-api');
jest.mock('axios');

describe('openai-api', () => {
  describe('createImage', () => {
    it('successfully creates an image', async () => {
      const mockResponse = { data: { images: ['imageData1', 'imageData2'] } };
      axios.post.mockResolvedValue(mockResponse);
      const result = await openai.createImage({ model: 'dall-e', prompt: 'A cat', n: 2 });
      expect(result).toEqual(mockResponse.data);
    });

    it('handles error on image creation', async () => {
      axios.post.mockRejectedValue(new Error('API error'));
      await expect(openai.createImage({ model: 'dall-e', prompt: 'A cat', n: 2 })).rejects.toThrow('API error');
    });
  });

  describe('createCompletion', () => {
    it('successfully generates completions', async () => {
      const mockResponse = { data: { choices: [{ text: 'Test completion' }] } };
      axios.post.mockResolvedValue(mockResponse);
      const result = await openai.createCompletion({ model: 'text-davinci-003', prompt: 'Hello', max_tokens: 5 });
      expect(result).toEqual(mockResponse.data);
    });

    it('handles error on generating completions', async () => {
      axios.post.mockRejectedValue(new Error('API error'));
      await expect(openai.createCompletion({ model: 'text-davinci-003', prompt: 'Hello', max_tokens: 5 })).rejects.toThrow('API error');
    });
  });

  describe('createEmbedding', () => {
    it('successfully generates embeddings', async () => {
      const mockResponse = { data: { embedding: ['embeddingData'] } };
      axios.post.mockResolvedValue(mockResponse);
      const result = await openai.createEmbedding({ model: 'text-similarity-babbage-001', input: 'This is a test' });
      expect(result).toEqual(mockResponse.data);
    });

    it('handles error on generating embeddings', async () => {
      axios.post.mockRejectedValue(new Error('API error'));
      await expect(openai.createEmbedding({ model: 'text-similarity-babbage-001', input: 'This is a test' })).rejects.toThrow('API error');
    });
  });
});
