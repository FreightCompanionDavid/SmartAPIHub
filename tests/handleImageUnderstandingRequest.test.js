const { handleImageUnderstandingRequest } = require('../handleImageUnderstandingRequest');
const openai = require('../openai-api');
const logger = require('../logger');
jest.mock('../openai-api');
jest.mock('../logger');

describe('handleImageUnderstandingRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully understands an image', async () => {
    const params = { image: 'validBase64Image', prompt: 'Describe this image.' };
    openai.createCompletion.mockResolvedValue({ choices: [{ text: 'A beautiful landscape.' }] });

    const result = await handleImageUnderstandingRequest(params);

    expect(result).toEqual({ success: true, response: 'A beautiful landscape.' });
  });

  it('handles OpenAI API error', async () => {
    const params = { image: 'validBase64Image', prompt: 'Describe this image.' };
    openai.createCompletion.mockRejectedValue(new Error('API error'));

    await expect(handleImageUnderstandingRequest(params)).rejects.toThrow('Failed to understand image.');
    expect(logger.error).toHaveBeenCalledWith("Error in image understanding with GPT-4V:", expect.anything());
  });

  it('returns error for invalid image input', async () => {
    const params = { image: 'invalidBase64Image', prompt: 'Describe this image.' };

    await expect(handleImageUnderstandingRequest(params)).rejects.toThrow('Invalid image provided.');
  });

  it('returns error for empty prompt', async () => {
    const params = { image: 'validBase64Image', prompt: '' };

    await expect(handleImageUnderstandingRequest(params)).rejects.toThrow('Invalid prompt provided.');
  });
});
