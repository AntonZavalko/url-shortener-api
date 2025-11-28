const { enableChaos, disableChaos } = require('../middlewares/chaos');

exports.enable = (req, res) => {
  enableChaos();
  res.json({ message: 'Chaos mode enabled' });
};

exports.disable = (req, res) => {
  disableChaos();
  res.json({ message: 'Chaos mode disabled' });
};
