const openai = require('./openai-api');
const logger = require('./logger'); // Added for structured logging
const { setCache, getCache } = require('../middleware/cache');

/**
 * Handles image understanding requests using GPT-4 with Vision.
 * @param {Object} params - The parameters for the image understanding request.
 * @param {string} params.image - The base64 encoded image or image URL.
 * @param {string} params.prompt - The prompt to guide the understanding.
 * @param {Object} [progress] - Optional object to track the progress of the request.
 * @returns {Promise<Object>} - The result of the image understanding request.
 */
async function handleImageUnderstandingRequest({ image, prompt }, progress = { progress: 0 }) {
  // Set initial progress
  progress.progress = 10;

  // Generate a cache key based on image and prompt
  const cacheKey = `image-${image}-prompt-${prompt}`;
  const cachedResponse = getCache(cacheKey);
  if (cachedResponse) {
    // If a cached response exists, update progress and return it
    progress.progress = 100; // Update to reflect immediate availability
    return cachedResponse;
  }

  try {
    // Update progress before sending the request
    progress.progress = 30;
    
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

    // Cache the successful response
    setCache(cacheKey, { success: true, response: response.choices[0].text.trim() });

    // Update progress to reflect completion
    progress.progress = 100;
    return { success: true, response: response.choices[0].text.trim() };
  } catch (error) {
    // Ensure progress is updated even in case of failure
    progress.progress = 100;
    logger.error("Error in image understanding with GPT-4V:", { error: error.message, image, prompt });
    throw new Error("Failed to understand image.");
  }
}

module.exports = handleImageUnderstandingRequest;