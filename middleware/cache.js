const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

function setCache(key, value, ttl = 100) {
    return cache.set(key, value, ttl);
}

function getCache(key) {
    return cache.get(key) || null;
}

module.exports = { setCache, getCache };
