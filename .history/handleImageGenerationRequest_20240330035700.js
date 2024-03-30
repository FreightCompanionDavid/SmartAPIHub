const openai = require('./openai-api');
const logger = require('./logger'); // Added for structured logging

/**
 * Handles image generation requests using DALL·E.
 */
async function handleImageGenerationRequest(prompt) {
  try {
    const response = await openai.createImage({
      model: "dall-e-3", // This is already the latest as specified, no change needed here.
      prompt: prompt,
      n: 1, // Number of images to generate
    });

    return { success: true, images: response.images };
  } catch (error) {
    logger.error("Error in image generation with DALL·E:", { error: error.message }); // Changed to structured logging
    throw new Error("Failed to generate image.");
  }
}

module.exports = handleImageGenerationRequest;
