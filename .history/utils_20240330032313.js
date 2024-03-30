const fs = require('fs');
const path = require('path');

/**
 * Converts an image file to a base64 encoded string.
 * @param {string} filePath - The path to the image file.
 * @returns {Promise<string>} A promise that resolves with the base64 encoded string of the image.
 */
async function convertImageToBase64(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, { encoding: 'base64' }, (err, data) => {
      if (err) {
        console.error('Error converting image to Base64:', err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * Validates if the provided text is suitable for processing.
 * @param {string} text - The text to validate.
 * @returns {boolean} True if the text is valid, false otherwise.
 */
function validateText(text) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    console.error('Invalid text input.');
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
  console.log(`Handling request in ${functionName}:`, JSON.stringify(requestDetails, null, 2));
}

/**
 * Saves generated images to a specified directory.
 * @param {Array<Buffer>} images - The images to save.
 * @param {string} directoryPath - The path to the directory where images should be saved.
 * @returns {Promise<Array<string>>} A promise that resolves with the paths of the saved images.
 */
async function saveGeneratedImages(images, directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  const savedImagePaths = images.map((image, index) => {
    const imagePath = path.join(directoryPath, `generatedImage_${Date.now()}_${index}.png`);
    fs.writeFileSync(imagePath, image, 'base64');
    return imagePath;
