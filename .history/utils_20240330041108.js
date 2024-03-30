const fs = require('fs').promises;
const path = require('path');
const logger = require('winston');

/**
 * Converts an image file to a base64 encoded string.
 * @param {string} filePath - The path to the image file.
 * @returns {Promise<string>} A promise that resolves with the base64 encoded string of the image.
 */
async function convertImageToBase64(filePath) {
  try {
    const data = await fs.readFile(filePath, { encoding: 'base64' });
    return data;
  } catch (err) {
    logger.error('Error converting image to Base64:', { error: err.message, filePath });
    throw err;
  }
}

/**
 * Validates if the provided text is suitable for processing.
 * @param {string} text - The text to validate.
 * @returns {boolean} True if the text is valid, false otherwise.
 */
function validateText(text) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    logger.error('Invalid text input.');
    return false;
  }
  return true;
}

/**
 * Logs the request details for debugging purposes.
 * @param {string} functionName - The name of the function handling the request.
 * @param {Object} requestDetails - The details of the request being handled.
 */
function logRequest(functionName, requestDetails) {
  logger.log(`Handling request in ${functionName}:`, JSON.stringify(requestDetails, null, 2));
}

/**
 * Saves generated images to a specified directory.
 * @param {Array<Buffer>} images - The images to save.
 * @param {string} directoryPath - The path to the directory where images should be saved.
 * @returns {Promise<Array<string>>} A promise that resolves with the paths of the saved images.
 */
async function saveGeneratedImages(images, directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });

  const savedImagePaths = await Promise.all(images.map(async (image, index) => {
    const imagePath = path.join(directoryPath, `generatedImage_${Date.now()}_${index}.png`);
    try {
      await fs.writeFile(imagePath, image, 'base64');
      return imagePath;
    } catch (error) {
      logger.error(`Error saving image: ${error.message}`);
      // Handle or log the error appropriately
    }
  }));

  return savedImagePaths.filter(Boolean);
}

module.exports = {
  convertImageToBase64,
  validateText,
  logRequest,
  saveGeneratedImages,
};
