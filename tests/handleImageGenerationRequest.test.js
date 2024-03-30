const { handleImageGenerationRequest } = require('../handleImageGenerationRequest');
const openai = require('../openai-api');
const logger = require('../logger');
jest.mock('../openai-api');
jest.mock('../logger');

describe('handleImageGenerationRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully generates images', async () => {
    const prompt = 'A futuristic cityscape';
    openai.createImage.mockResolvedValue({ images: ['imageData1', 'imageData2'] });

    const result = await handleImageGenerationRequest(prompt);

    expect(result).toEqual({ success: true, images: ['imageData1', 'imageData2'] });
    expect(openai.createImage).toHaveBeenCalledWith({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
    });
  });

  it('handles OpenAI API error', async () => {
    const prompt = 'A surreal painting of a dream';
    openai.createImage.mockRejectedValue(new Error('API error'));

    await expect(handleImageGenerationRequest(prompt)).rejects.toThrow('Failed to generate image.');
    expect(logger.error).toHaveBeenCalledWith("Error in image generation with DALL·E:", expect.anything());
  });

  it('returns error for empty prompt', async () => {
    const prompt = '';

    await expect(handleImageGenerationRequest(prompt)).rejects.toThrow('Invalid prompt provided.');
  });

  it('returns error for non-string prompt', async () => {
    const prompt = 12345;

    await expect(handleImageGenerationRequest(prompt)).rejects.toThrow('Invalid prompt provided.');
  });

  it('handles extremely long prompt', async () => {
    const prompt = 'A'.repeat(10000); // Extremely long prompt
    openai.createImage.mockResolvedValue({ images: ['imageData'] });

    const result = await handleImageGenerationRequest(prompt);

    expect(result).toEqual({ success: true, images: ['imageData'] });
  });

  it('handles prompt with special characters', async () => {
    const prompt = '@#$%^&*()_+[]{}|;:,.<>?';
    openai.createImage.mockResolvedValue({ images: ['imageData'] });

    const result = await handleImageGenerationRequest(prompt);

    expect(result).toEqual({ success: true, images: ['imageData'] });
  });

  it('handles OpenAI API rate limit error', async () => {
    const prompt = 'A simple prompt';
    const error = new Error('API rate limit exceeded');
    error.response = { status: 429 };
    openai.createImage.mockRejectedValue(error);

    await expect(handleImageGenerationRequest(prompt)).rejects.toThrow('Failed to generate image due to rate limit.');
    expect(logger.error).toHaveBeenCalledWith("Error in image generation with DALL·E due to rate limit:", expect.anything());
  });

  it('handles OpenAI API internal server error', async () => {
    const prompt = 'Another simple prompt';
    const error = new Error('Internal server error');
    error.response = { status: 500 };
    openai.createImage.mockRejectedValue(error);

    await expect(handleImageGenerationRequest(prompt)).rejects.toThrow('Failed to generate image due to server error.');
    expect(logger.error).toHaveBeenCalledWith("Error in image generation with DALL·E due to server error:", expect.anything());
  });
});
