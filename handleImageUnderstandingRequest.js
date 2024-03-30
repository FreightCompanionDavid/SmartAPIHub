const openai = require('./openai-api');
const logger = require('./logger'); // Added for structured logging

/**
 * Handles image understanding requests using GPT-4 with Vision.
 * @param {Object} params - The parameters for the image understanding request.
 * @param {string} params.image - The base64 encoded image or image URL.
 * @param {string} params.prompt - The prompt to guide the understanding.
 * @returns {Promise<Object>} - The result of the image understanding request.
 */
async function handleImageUnderstandingRequest({ image, prompt }, progress) {
  progress.progress = 10; // Initial progress after starting the request
  try {
    progress.progress = 30; // Progress before sending the request
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

    progress.progress = 100; // Final progress after receiving the response
    return { success: true, response: response.choices[0].text.trim() };
  } catch (error) {
    progress.progress = 100; // Update progress even in case of failure
    logger.error("Error in image understanding with GPT-4V:", { error: error.message, image, prompt }); // Enhanced error logging with more context
    throw new Error("Failed to understand image.");
  }
}

module.exports = handleImageUnderstandingRequest;
