const urlService = require('../services/urlService');


exports.top = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const urls = await urlService.getTopUrls(limit);
    res.json({ limit, urls });
  } catch (err) {
    next(err);
  }
};
