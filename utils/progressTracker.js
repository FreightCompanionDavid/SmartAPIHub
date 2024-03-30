const EventEmitter = require('events');

class ProgressTracker extends EventEmitter {
  constructor(totalSize) {
    super();
    this.totalSize = totalSize;
    this.currentProgress = 0;
    this.startTime = Date.now();
  }

  updateProgress(bytes) {
    this.currentProgress += bytes;
    const progressPercentage = this.getProgressPercentage();
    const eta = this.calculateETA();
    this.emit('progress', { progressPercentage, eta });
  }

  calculateETA() {
    const elapsedTime = Date.now() - this.startTime;
    const rate = this.currentProgress / elapsedTime;
    const remainingTime = (this.totalSize - this.currentProgress) / rate;
    return Math.round(remainingTime / 1000); // Convert to seconds
  }

  getProgressPercentage() {
    return Math.round((this.currentProgress / this.totalSize) * 100);
  }
}

module.exports = ProgressTracker;
