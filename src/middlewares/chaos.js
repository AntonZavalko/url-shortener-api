const metrics = require('../services/metricsService');

let chaosEnabled = false;

function enableChaos() {
  chaosEnabled = true;
}

function disableChaos() {
  chaosEnabled = false;
}

function chaosMonkey(req, res, next) {
  if (chaosEnabled && Math.random() < 0.1) {
    metrics.registerError();
    return res.status(500).json({ error: 'Chaos monkey strike!' });
  }
  next();
}

module.exports = { chaosMonkey, enableChaos, disableChaos };
