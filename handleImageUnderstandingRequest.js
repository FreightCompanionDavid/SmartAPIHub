const openai = require('./openai-api');
const logger = require('./logger'); // Added for structured logging

/**
 * Handles image understanding requests using GPT-4 with Vision.
 * @param {Object} params - The parameters for the image understanding request.
 * @param {string} params.image - The base64 encoded image or image URL.
 * @param {string} params.prompt - The prompt to guide the understanding.
 * @returns {Promise<Object>} - The result of the image understanding request.
 */
async function handleImageUnderstandingRequest({ image, prompt }) {
  try {
    const response = await openai.createCompletion({
      model: "gpt-4-1106-vision-preview", // Ensure this model identifier is up-to-date
      prompt: prompt,
      attachments: [
        {
          data: image, // Base64 encoded image or image URL
          type: "image",
        },
      ],
      temperature: 0.5,
      max_tokens: 150,
    });

    return { success: true, response: response.choices[0].text.trim() };
  } catch (error) {
    logger.error("Error in image understanding with GPT-4V:", { error: error.message, image, prompt }); // Enhanced error logging with more context
    throw new Error("Failed to understand image.");
  }
}

module.exports = handleImageUnderstandingRequest;
