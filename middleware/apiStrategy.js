const { apiStrategies } = require('../config.json');

function applyApiStrategies(req, res, next) {
    if (apiStrategies.rateLimiting) {
        // Implementing basic rate limiting
        const rateLimit = apiStrategies.rateLimiting;
        const userIp = req.ip;
        const path = req.path;
        const key = `${userIp}:${path}`;
        if (!rateLimit.counts[key]) {
            rateLimit.counts[key] = 1;
        } else {
            rateLimit.counts[key]++;
        }
        if (rateLimit.counts[key] > rateLimit.maxRequests) {
            return res.status(429).send('Too many requests');
        }
        setTimeout(() => {
            rateLimit.counts[key]--;
        }, rateLimit.windowMs);
    }

    if (apiStrategies.caching) {
        // Implementing basic caching
        const cache = apiStrategies.caching;
        const path = req.path;
        if (cache[path]) {
            return res.send(cache[path]);
        }
        const originalSend = res.send;
        res.send = function(body) {
            cache[path] = body;
            originalSend.call(this, body);
        };
    }

    next();
}

module.exports = applyApiStrategies;
