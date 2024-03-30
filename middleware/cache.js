const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

function setCache(key, value, ttl = 100) {
    // Serialize the value before caching
    const serializedValue = JSON.stringify(value);
    return cache.set(key, serializedValue, ttl);
}

function getCache(key) {
    const value = cache.get(key);
    // Deserialize the value when retrieving from the cache
    return value ? JSON.parse(value) : null;
}

module.exports = { setCache, getCache };
