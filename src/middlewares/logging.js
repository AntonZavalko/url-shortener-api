const { SERVER_ID } = require('../config/env');
const metrics = require('../services/metricsService');

function requestLogger(req, res, next) {
  const start = Date.now();
  metrics.beforeRequest();

  const originalWriteHead = res.writeHead;

  res.writeHead = function (statusCode, headers) {
    const duration = Date.now() - start;
    res.setHeader('X-Server-Id', SERVER_ID);
    res.setHeader('X-Response-Time', `${duration}ms`);
    return originalWriteHead.call(this, statusCode, headers);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.afterRequest(duration);

    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration_ms: duration,
      server_id: SERVER_ID
    };

    console.log(JSON.stringify(logEntry));
  });

  next();
}

module.exports = { requestLogger };
