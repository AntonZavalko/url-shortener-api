const urlService = require('../services/urlService');
const { BASE_URL } = require('../config/env');

exports.shorten = async (req, res, next) => {
  try {
    const { longUrl, userId, customAlias, expiresAt, tags } = req.body;

    if (!longUrl) {
      return res.status(400).json({ error: 'longUrl is required' });
    }

    const row = await urlService.createUrl({
      longUrl,
      userId,
      customAlias,
      expiresAt,
      tags
    });

    res.status(201).json({
      id: row.id,
      short_code: row.short_code,
      short_url: `${BASE_URL}/${row.short_code}`,  
      long_url: row.long_url,
      user_id: row.user_id,
      click_count: row.click_count,
      created_at: row.created_at,
      expires_at: row.expires_at,
      is_active: row.is_active,
      custom_alias: row.custom_alias
    });
  } catch (err) {
    next(err);
  }
};

exports.redirect = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const result = await urlService.resolveShortCode(shortCode, req);

    if (!result) {
      return res.status(404).json({ error: 'Short URL not found or inactive' });
    }

    res.redirect(result.longUrl);
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const stats = await urlService.getUrlStats(shortCode);

    if (!stats) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.json(stats);
  } catch (err) {
    next(err);
  }
};

exports.getUserUrls = async (req, res, next) => {
  try {
    const { id } = req.params;
    const urls = await urlService.getUserUrls(id);
    res.json({ user_id: id, urls });
  } catch (err) {
    next(err);
  }
};

exports.updateUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const { longUrl, expiresAt, isActive, customAlias, tags } = req.body;

    const updated = await urlService.updateUrl(shortCode, {
      longUrl,
      expiresAt,
      isActive,
      customAlias,
      tags
    });

    if (!updated) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.json({ message: 'URL updated', url: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const deleted = await urlService.deleteUrl(shortCode);

    if (!deleted) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.json({ message: 'URL deactivated' });
  } catch (err) {
    next(err);
  }
};

exports.bulkShorten = async (req, res, next) => {
  try {
    const { urls, userId } = req.body;
    const created = await urlService.bulkCreate({ urls, userId });

    res.status(201).json({
      created: created.length,
      urls: created
    });
  } catch (err) {
    next(err);
  }
};
