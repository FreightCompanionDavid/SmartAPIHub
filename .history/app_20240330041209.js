require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { body, validationResult, sanitizeBody } = require('express-validator');
const handleImageGenerationRequest = require('./handleImageGenerationRequest');
const handleImageUnderstandingRequest = require('./handleImageUnderstandingRequest');
const handleEmbeddingRequest = require('./handleEmbeddingRequest');
const logger = require('./logger'); // Assuming logger.js setup is done

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/generate-image', [body('prompt').not().isEmpty().withMessage('Prompt is required').trim().escape()], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const prompt = req.body.prompt;
        const result = await handleImageGenerationRequest(prompt);
        res.send(result);
    } catch (error) {
        logger.error("Error in image generation request:", { error: error.message, prompt: req.body.prompt });
        res.status(500).send({ error: "An unexpected error occurred." });
    }
});

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
        const result = await handleImageUnderstandingRequest({ image, prompt });
        res.send(result);
    } catch (error) {
        logger.error("Error in image understanding request:", { error: error.message, image: req.body.image, prompt: req.body.prompt });
        res.status(500).send({ error: "An unexpected error occurred." });
    }
});

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
        const result = await handleEmbeddingRequest(text, model);
        res.send(result);
    } catch (error) {
        logger.error("Error in embedding request:", { error: error.message, text: req.body.text, model: req.body.model });
        res.status(500).send({ error: "An unexpected error occurred." });
    }
});

// Centralized error handler middleware
app.use((err, req, res, next) => {
    logger.error(err.message);
    res.status(500).json({ error: "An unexpected error occurred." });
app.listen(port, () => {
    logger.log(`Server running on port ${port}`);
});
