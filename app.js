require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const handleImageGenerationRequest = require('./handleImageGenerationRequest');
const handleImageUnderstandingRequest = require('./handleImageUnderstandingRequest');
const handleEmbeddingRequest = require('./handleEmbeddingRequest');
const logger = require('./logger'); // Assuming logger.js setup is done
const { createDiscussion, getDiscussions } = require('./handleDiscussionsRequest');
const { streamingControl } = require('./middleware/streamingControl');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for streaming control, applied globally or selectively based on requirements
app.use(streamingControl);

// Middleware for progress tracking on specific routes
app.use((req, res, next) => {
    if (['/generate-image', '/understand-image', '/generate-embedding'].includes(req.path)) {
        req.progress = { progress: 0 };
    }
    next();
});

// Endpoint for generating images
app.post('/generate-image', [body('prompt').not().isEmpty().withMessage('Prompt is required').trim().escape()], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const prompt = req.body.prompt;
        const result = await handleImageGenerationRequest(prompt, req.progress); // Assuming handleImageGenerationRequest supports progress tracking
        res.send(result);
    } catch (error) {
        logger.error("Error in image generation request:", { error: error.message, prompt: req.body.prompt });
        res.status(500).send({ error: "Failed to generate image due to an internal server error." });
    }
});

// Endpoint for understanding images
app.post('/understand-image', [
    body('image').not().isEmpty().withMessage('Image is required').trim().escape(),
    body('prompt').not().isEmpty().withMessage('Prompt is required').trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { image, prompt } = req.body;
        const result = await handleImageUnderstandingRequest({ image, prompt }, req.progress); // Assuming handleImageUnderstandingRequest supports progress tracking
        res.send(result);
    } catch (error) {
        logger.error("Error in image understanding request:", { error: error.message, image: req.body.image, prompt: req.body.prompt });
        res.status(500).send({ error: "Failed to understand image due to an internal server error." });
    }
});

// Endpoint for generating embeddings
app.post('/generate-embedding', [
    body('text').not().isEmpty().withMessage('Text is required').trim().escape(),
    body('model').optional().trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const text = req.body.text;
        const model = req.body.model; // Optional, will use default if not provided
        const result = await handleEmbeddingRequest(text, model, req.progress); // Assuming handleEmbeddingRequest supports progress tracking
        res.send(result);
    } catch (error) {
        logger.error("Error in embedding request:", { error: error.message, text: req.body.text, model: req.body.model });
        res.status(500).send({ error: "Failed to generate embedding due to an internal server error." });
    }
});

// Centralized error handler middleware
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => res.send('OK'));

// Endpoint for creating discussions
app.post('/discussions/create', [
    body('author').not().isEmpty().withMessage('Author is required').trim().escape(),
    body('content').not().isEmpty().withMessage('Content is required').trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { author, content } = req.body;
        const result = await createDiscussion(content, author);
        res.send(result);
    } catch (error) {
        logger.error("Error in creating discussion:", { error: error.message, author: req.body.author, content: req.body.content });
        res.status(500).send({ error: "Failed to process discussion request due to an internal server error." });
    }
});

// Endpoint for retrieving all discussions
app.get('/discussions', async (req, res) => {
    try {
        const discussions = await getDiscussions();
        res.send(discussions);
    } catch (error) {
        logger.error("Error in retrieving discussions:", { error: error.message });
        res.status(500).send({ error: "An unexpected error occurred." });
    }
});

app.listen(port, () => {
    logger.log(`Server running on port ${port}`);
});