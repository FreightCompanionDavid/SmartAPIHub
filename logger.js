const winston = require('winston');

const logLevel = process.env.LOG_LEVEL || 'info';

const logger = winston.createLogger({
    level: logLevel, // Dynamic log level
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Timestamps in logs
        winston.format.json() // JSON formatted logs
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        // Write all logs with level `error` and below to `error.log`
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        // Write all logs with level `info` and below to `combined.log`
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest })`
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Consistent timestamp formatting
            winston.format.simple() // Simple formatting for readability
        ),
    }));
}

module.exports = logger;