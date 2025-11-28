const metrics = require('../services/metricsService');
const { cacheStats } = require('../services/cacheService');

exports.getMetrics = (req, res) => {
  const base = metrics.getMetrics();
  const cache = cacheStats();

  res.json({
    ...base,
    cache_attempts: cache.attempts,
    cache_hits: cache.hits,
    cache_hit_rate: cache.hitRate
  });
};
