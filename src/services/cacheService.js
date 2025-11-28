const { CACHE_ENABLED } = require('../config/env');

const cache = new Map();
let hits = 0;
let attempts = 0;

function cacheGet(key) {
  if (!CACHE_ENABLED) return null;
  attempts++;
  if (cache.has(key)) {
    hits++;
    return cache.get(key);
  }
  return null;
}

function cacheSet(key, value) {
  if (!CACHE_ENABLED) return;
  cache.set(key, value);
}

function cacheDelete(key) {
  if (!CACHE_ENABLED) return;
  cache.delete(key);
}

function cacheStats() {
  return {
    attempts,
    hits,
    hitRate: attempts === 0 ? 0 : hits / attempts
  };
}

module.exports = {
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheStats
};
