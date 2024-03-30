const { Writable, Readable } = require('stream');
const { verifyToken } = require('./auth');
const { v4: uuidv4 } = require('uuid');

let activeStreams = {};

const streamingControl = (req, res, next) => {
  verifyToken(req, res, () => {
    const streamId = req.query.streamId;
    if (req.path.includes('/stream') && streamId && activeStreams[streamId]) {
      req.streamControl = {
        pause: () => pauseStream(streamId),
        resume: () => resumeStream(streamId),
        monitorProgress: () => monitorProgress(streamId)
      };
    }
    next();
  });
};

function pauseStream(streamId) {
  const streamInfo = activeStreams[streamId];
  if (streamInfo && streamInfo.stream.isPaused() === false) {
    streamInfo.stream.pause();
    streamInfo.state = 'paused';
  }
}

function resumeStream(streamId) {
  const streamInfo = activeStreams[streamId];
  if (streamInfo && streamInfo.stream.isPaused()) {
    streamInfo.stream.resume();
    streamInfo.state = 'running';
  }
}

function monitorProgress(streamId) {
  const streamInfo = activeStreams[streamId];
  if (streamInfo) {
    return streamInfo.progress;
  }
  return null;
}

function registerStream(stream) {
  const streamId = uuidv4();
  const streamInfo = {
    stream: stream,
    state: 'running',
    progress: 0
  };
  stream.on('data', (chunk) => {
    streamInfo.progress += chunk.length;
  });
  activeStreams[streamId] = streamInfo;
  return streamId;
}

module.exports = { streamingControl, pauseStream, resumeStream, monitorProgress, registerStream };
