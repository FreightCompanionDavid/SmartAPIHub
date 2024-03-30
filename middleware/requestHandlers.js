const openai = require('../openai-api');
const logger = require('../logger');
const { setCache, getCache } = require('./cache');

async function handleEmbeddingRequest(req, res, progress, model = "text-embedding-3-large") {
    try {
        await new Promise((resolve, reject) => {
            verifyToken(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        progress.progress = 10;

        const text = req.body.text;
        if (!text || typeof text !== 'string' || text.length < 10) {
            logger.error('Validation Error: The text parameter must be a non-empty string and at least 10 characters long.', { text });
            res.status(400).send({ message: 'Validation Error: The text parameter must be a non-empty string and at least 10 characters long.' });
            return;
        }

        progress.progress = 30;

        const response = await openai.createEmbedding({
            model,
            input: text,
        });

        progress.progress = 100;

        res.status(200).send({ success: true, embedding: response.data });
    } catch (error) {
        progress.progress = 100;
        logger.error({message: "Failed to generate text embeddings due to an error", error: error.message, text, model});
        res.status(500).send({ message: "Failed to generate text embeddings. Please ensure your request is properly authenticated and the text parameter meets the required criteria." });
    }
}

async function handleImageGenerationRequest(prompt, progress) {
    progress.progress = 10;
    try {
        progress.progress = 30;
        const response = await openai.createImage({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
        });

        progress.progress = 100;
        return { success: true, images: response.images };
    } catch (error) {
        progress.progress = 100;
        logger.error({message: "Error in image generation with DALL·E", error: error.message, prompt});
        throw new Error("Failed to generate image.");
    }
}

async function handleImageUnderstandingRequest({ image, prompt }, progress = { progress: 0 }) {
  progress.progress = 10;

  const cacheKey = `image-${image}-prompt-${prompt}`;
  const cachedResponse = getCache(cacheKey);
  if (cachedResponse) {
    progress.progress = 100;
    return cachedResponse;
  }

  try {
    progress.progress = 30;
    
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

    setCache(cacheKey, { success: true, response: response.choices[0].text.trim() });

    progress.progress = 100;
    return { success: true, response: response.choices[0].text.trim() };
  } catch (error) {
    progress.progress = 100;
    logger.error({ message: "Error in image understanding with GPT-4V", error: error.message, image, prompt });
    throw new Error("Failed to understand image.");
  }
}

module.exports = {
  handleEmbeddingRequest,
  handleImageGenerationRequest,
  handleImageUnderstandingRequest,
};
