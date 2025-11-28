const metrics = require('../services/metricsService');

function errorHandler(err, req, res, next) {
  console.error('ERROR:', err);

  metrics.registerError();

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({ error: 'Internal Server Error' });
}

module.exports = { errorHandler };
