const logger = require('../logger');

function validateText(text) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    logger.error('Invalid text input.', { text });
    return false;
  }
  return true;
}

module.exports = {
  validateText,
};
