const express = require('express');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const handleImageGenerationRequest = require('./handleImageGenerationRequest');
const handleImageUnderstandingRequest = require('./handleImageUnderstandingRequest');
const handleEmbeddingRequest = require('./handleEmbeddingRequest');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/generate-image', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt) {
      return res.status(400).send({ error: 'Prompt is required' });
    }
    const result = await handleImageGenerationRequest(prompt);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post('/understand-image', async (req, res) => {
  try {
    const { image, prompt } = req.body;
    if (!image || !prompt) {
      return res.status(400).send({ error: 'Image and prompt are required' });
    }
    const result = await handleImageUnderstandingRequest({ image, prompt });
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post('/generate-embedding', async (req, res) => {
  try {
    const text = req.body.text;
    const model = req.body.model; // Optional, will use default if not provided
    if (!text) {
      return res.status(400).send({ error: 'Text is required' });
    }
    const result = await handleEmbeddingRequest(text, model);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
