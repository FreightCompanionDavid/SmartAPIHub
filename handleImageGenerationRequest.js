/**
 * This function is responsible for generating images based on a given prompt using OpenAI's DALL·E model. It tracks the request's progress and handles any errors that may occur during the image generation process.
 */
async function handleImageGenerationRequest(imageGenerationPrompt, requestProgress) {
    requestProgress.progress = 10; // Marks the beginning of the image generation process
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
        // Log the error with structured logging format
        // This includes the error message and the prompt used for image generation
        // It helps in diagnosing issues with the image generation process
        logger.error({message: "Error in image generation with DALL·E", error: error.message, imageGenerationPrompt});
        throw new Error("Failed to generate image.");
    }
}

module.exports = handleImageGenerationRequest;
