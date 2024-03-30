const { handleEmbeddingRequest } = require('../handleEmbeddingRequest');
const openai = require('../openai-api');
const jwt = require('jsonwebtoken');
const logger = require('../logger');
jest.mock('../openai-api');
jest.mock('jsonwebtoken');
jest.mock('../logger');

describe('handleEmbeddingRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully generates text embedding', async () => {
    const req = { body: { text: 'This is a test text longer than ten characters' }, headers: { authorization: 'Bearer validToken' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    openai.createEmbedding.mockResolvedValue({ data: { embedding: 'testEmbedding' } });
    jwt.verify.mockImplementation((token, secret, callback) => callback(null, { id: 'userId' }));

    await handleEmbeddingRequest(req, res);

    expect(res.send).toHaveBeenCalledWith({ success: true, embedding: { embedding: 'testEmbedding' } });
  });

  it('handles OpenAI API error', async () => {
    const req = { body: { text: 'Valid text for testing' }, headers: { authorization: 'Bearer validToken' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    openai.createEmbedding.mockRejectedValue(new Error('OpenAI API error'));
    jwt.verify.mockImplementation((token, secret, callback) => callback(null, { id: 'userId' }));

    await handleEmbeddingRequest(req, res);

    expect(logger.error).toHaveBeenCalledWith("Error in generating text embeddings:", expect.anything());
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('returns validation error for invalid text input', async () => {
    const req = { body: { text: 'short' }, headers: { authorization: 'Bearer validToken' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await handleEmbeddingRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: 'Validation Error: Text parameter must be a non-empty string and at least 10 characters long.' });
  });

  describe('Authentication Middleware', () => {
    it('allows request with valid token', async () => {
      const req = { body: { text: 'Valid text for testing' }, headers: { authorization: 'Bearer validToken' } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, { id: 'userId' }));

      await handleEmbeddingRequest(req, res);

      expect(res.send).toHaveBeenCalled();
    });

    it('blocks request with no token', async () => {
      const req = { body: { text: 'Valid text for testing' }, headers: {} };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

      await handleEmbeddingRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({ message: 'No token provided!' });
    });
  });

  it('handles invalid model parameters error', async () => {
    const req = { body: { text: 'Valid text for testing with invalid model parameters' }, headers: { authorization: 'Bearer validToken' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    openai.createEmbedding.mockRejectedValue(new Error('Invalid model parameters'));
    jwt.verify.mockImplementation((token, secret, callback) => callback(null, { id: 'userId' }));

    await handleEmbeddingRequest(req, res);

    expect(logger.error).toHaveBeenCalledWith("Error in generating text embeddings due to invalid model parameters:", expect.anything());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: 'Invalid model parameters provided.' });
  });

  it('handles network issues when calling OpenAI API', async () => {
    const req = { body: { text: 'Valid text for testing but network fails' }, headers: { authorization: 'Bearer validToken' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    openai.createEmbedding.mockRejectedValue(new Error('Network error'));
    jwt.verify.mockImplementation((token, secret, callback) => callback(null, { id: 'userId' }));

    await handleEmbeddingRequest(req, res);

    expect(logger.error).toHaveBeenCalledWith("Failed to generate text embeddings due to network issues:", expect.anything());
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.send).toHaveBeenCalledWith({ message: 'Service Unavailable: Failed to connect to OpenAI API due to network issues.' });
  });
});
