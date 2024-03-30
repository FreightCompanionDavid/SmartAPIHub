const openai = require('./openai-api');
const logger = require('./logger');
const { InternalServerError } = require('./middleware/customErrors');

async function handleImageGenerationRequest(prompt) {
    try {
        const response = await openai.createImage({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
        });
        return { success: true, images: response.images };
    } catch (error) {
        logger.error("Error in image generation with DALL·E:", { error: error.message, prompt });
        throw new InternalServerError("Failed to generate image.");
    }
}

module.exports = handleImageGenerationRequest;

const openai = require('./openai-api');
const logger = require('./logger');
const { InternalServerError } = require('./middleware/customErrors');

async function handleImageUnderstandingRequest({ image, prompt }) {
  try {
    const response = await openai.createCompletion({
      model: "gpt-4-1106-vision-preview",
      prompt: prompt,
      attachments: [
        {
          data: image,
          type: "image",
        },
      ],
      temperature: 0.5,
      max_tokens: 150,
    });
    return { success: true, response: response.choices[0].text.trim() };
  } catch (error) {
    logger.error("Error in image understanding with GPT-4V:", { error: error.message, image, prompt });
    throw new InternalServerError("Failed to understand image.");
  }
}

module.exports = handleImageUnderstandingRequest;

const logger = require('./logger');
const { InternalServerError } = require('./middleware/customErrors');

let discussions = [];

function createDiscussion(content, author) {
    try {
        const discussion = {
            content,
            author,
            timestamp: new Date().toISOString()
        };
        discussions.push(discussion);
        return discussion;
    } catch (error) {
        logger.error("Error creating discussion:", { error: error.message, content, author });
        throw new InternalServerError("Failed to create discussion");
    }
}

function getDiscussions() {
    try {
        return discussions;
    } catch (error) {
        logger.error("Error retrieving discussions:", { error: error.message });
        throw new InternalServerError("Failed to retrieve discussions");
    }
}

module.exports = { createDiscussion, getDiscussions };
