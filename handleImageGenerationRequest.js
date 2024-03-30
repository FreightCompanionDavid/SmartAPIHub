const openai = require('./openai-api');
const logger = require('./logger'); // Added for structured logging

/**
 * Handles image generation requests using DALL·E.
 */
async function handleImageGenerationRequest(prompt, progress) {
    progress.progress = 10; // Initial progress after starting the request
    try {
        progress.progress = 30; // Progress before sending the request
        const response = await openai.createImage({
            model: "dall-e-3", // This is already the latest as specified, no change needed here.
            prompt: prompt,
            n: 1, // Number of images to generate
        });

        progress.progress = 100; // Final progress after receiving the response
        return { success: true, images: response.images };
    } catch (error) {
        progress.progress = 100; // Update progress even in case of failure
        logger.error("Error in image generation with DALL·E:", { error: error.message, prompt }); // Enhanced error logging with more context
        throw new Error("Failed to generate image.");
    }
}

module.exports = handleImageGenerationRequest;
