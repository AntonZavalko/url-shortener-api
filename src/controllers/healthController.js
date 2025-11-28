const { SERVER_ID } = require('../config/env');
const metrics = require('../services/metricsService');

exports.health = (req, res) => {
  const m = metrics.getMetrics();
  res.json({
    status: 'healthy',
    server_id: SERVER_ID,
    uptime_sec: m.uptime_seconds,
    request_count: m.total_requests,
    metrics: m
  });
};
