const progressTracker = (req, res, next) => {
    const progressObject = {
        currentProgress: 0,
        totalSteps: 100,
        statusMessage: 'Starting',
        updateProgress: function(stepIncrement, message) {
            this.currentProgress += stepIncrement;
            if (message) {
                this.statusMessage = message;
            }
            if (this.currentProgress > this.totalSteps) {
                this.currentProgress = this.totalSteps;
            }
        },
        getProgress: function() {
            return {
                percentage: (this.currentProgress / this.totalSteps) * 100,
                statusMessage: this.statusMessage
            };
        }
    };

    req.progressTracker = progressObject;
    next();
};

module.exports = progressTracker;
