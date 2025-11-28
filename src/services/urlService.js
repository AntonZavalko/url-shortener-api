const pool = require('../db/pool');
const { simulateDbLatency } = require('./latencyService');
const { cacheGet, cacheSet, cacheDelete } = require('./cacheService');

function generateShortCode(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let res = '';
  for (let i = 0; i < length; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

function isUrlActive(row) {
  if (!row.is_active) return false;
  if (!row.expires_at) return true;
  return new Date(row.expires_at) > new Date();
}

async function createUrl({ longUrl, userId = null, customAlias = null, expiresAt = null, tags = [] }) {
  await simulateDbLatency('write');

  let shortCode = customAlias || generateShortCode();

  if (customAlias) {
    const check = await pool.query(
      'SELECT 1 FROM urls WHERE short_code = $1',
      [customAlias]
    );
    if (check.rowCount > 0) {
      const err = new Error('Custom alias already in use');
      err.code = 'ALIAS_TAKEN';
      throw err;
    }
  } else {
    let exists = true;
    while (exists) {
      const check = await pool.query(
        'SELECT 1 FROM urls WHERE short_code = $1',
        [shortCode]
      );
      if (check.rowCount === 0) {
        exists = false;
      } else {
        shortCode = generateShortCode();
      }
    }
  }

  const insertUrl = await pool.query(
    `
      INSERT INTO urls (short_code, long_url, user_id, expires_at, custom_alias)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [shortCode, longUrl, userId, expiresAt || null, customAlias || null]
  );

  const urlRow = insertUrl.rows[0];

  if (Array.isArray(tags) && tags.length > 0) {
    for (const tag of tags) {
      await pool.query(
        'INSERT INTO url_tags (url_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [urlRow.id, tag]
      );
    }
  }

  cacheSet(shortCode, longUrl);

  return urlRow;
}

async function bulkCreate({ urls, userId = null }) {
  if (!Array.isArray(urls)) {
    throw new Error('urls must be an array');
  }
  if (urls.length > 100) {
    throw new Error('Maximum 100 URLs per bulk request');
  }

  const created = [];

  for (const longUrl of urls) {
    if (!longUrl) continue;
    try {
      const row = await createUrl({ longUrl, userId });
      created.push({
        short_code: row.short_code,
        long_url: row.long_url
      });
    } catch (e) {
      console.error('Bulk create error:', e.message);
    }
  }

  return created;
}

async function resolveShortCode(shortCode, req) {
  await simulateDbLatency('read');

  let longUrl = cacheGet(shortCode);

  const urlResult = await pool.query(
    'SELECT * FROM urls WHERE short_code = $1',
    [shortCode]
  );

  if (urlResult.rowCount === 0) return null;

  const urlRow = urlResult.rows[0];

  if (!isUrlActive(urlRow)) return null;

  if (!longUrl) {
    longUrl = urlRow.long_url;
    cacheSet(shortCode, longUrl);
  }

  await simulateDbLatency('write');

  await pool.query(
    'UPDATE urls SET click_count = click_count + 1 WHERE id = $1',
    [urlRow.id]
  );

  await pool.query(
    `
      INSERT INTO clicks (url_id, ip_address, user_agent, referer, country_code, city, device_type)
      VALUES ($1, $2, $3, $4, NULL, NULL, NULL)
    `,
    [
      urlRow.id,
      req.ip || null,
      req.headers['user-agent'] || null,
      req.headers['referer'] || null
    ]
  );

  return { longUrl, url: urlRow };
}

async function getUrlStats(shortCode) {
  await simulateDbLatency('read');

  const urlResult = await pool.query(
    'SELECT * FROM urls WHERE short_code = $1',
    [shortCode]
  );
  if (urlResult.rowCount === 0) return null;

  const urlRow = urlResult.rows[0];

  const clicksResult = await pool.query(
    'SELECT * FROM clicks WHERE url_id = $1 ORDER BY clicked_at DESC LIMIT 1000',
    [urlRow.id]
  );

  return {
    url: urlRow,
    clicks: clicksResult.rows
  };
}

async function getUserUrls(userId) {
  await simulateDbLatency('read');

  const result = await pool.query(
    'SELECT * FROM urls WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );

  return result.rows;
}

async function updateUrl(shortCode, { longUrl, expiresAt, isActive, customAlias, tags }) {
  await simulateDbLatency('write');

  const urlResult = await pool.query(
    'SELECT * FROM urls WHERE short_code = $1',
    [shortCode]
  );
  if (urlResult.rowCount === 0) return null;

  const urlRow = urlResult.rows[0];
  let newShortCode = shortCode;

  if (customAlias && customAlias !== shortCode) {
    const check = await pool.query(
      'SELECT 1 FROM urls WHERE short_code = $1',
      [customAlias]
    );
    if (check.rowCount > 0) {
      const err = new Error('New alias already in use');
      err.code = 'ALIAS_TAKEN';
      throw err;
    }

    await pool.query(
      `
        UPDATE urls
        SET short_code = $1, custom_alias = $1
        WHERE id = $2
      `,
      [customAlias, urlRow.id]
    );

    cacheDelete(shortCode);
    cacheSet(customAlias, longUrl || urlRow.long_url);

    newShortCode = customAlias;
  }

  const fields = [];
  const values = [];
  let idx = 1;

  if (longUrl !== undefined) {
    fields.push(`long_url = $${idx++}`);
    values.push(longUrl);
  }
  if (expiresAt !== undefined) {
    fields.push(`expires_at = $${idx++}`);
    values.push(expiresAt || null);
  }
  if (typeof isActive === 'boolean') {
    fields.push(`is_active = $${idx++}`);
    values.push(isActive);
  }

  if (fields.length > 0) {
    values.push(urlRow.id);
    const query = `
      UPDATE urls
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
    const updated = await pool.query(query, values);
    Object.assign(urlRow, updated.rows[0]);
  }

  if (longUrl !== undefined) {
    cacheSet(newShortCode, urlRow.long_url);
  }

  if (Array.isArray(tags)) {
    await pool.query('DELETE FROM url_tags WHERE url_id = $1', [urlRow.id]);
    for (const tag of tags) {
      await pool.query(
        'INSERT INTO url_tags (url_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [urlRow.id, tag]
      );
    }
  }

  const finalRes = await pool.query('SELECT * FROM urls WHERE id = $1', [urlRow.id]);
  return finalRes.rows[0];
}

async function deleteUrl(shortCode) {
  await simulateDbLatency('write');

  const result = await pool.query(
    `
      UPDATE urls
      SET is_active = FALSE
      WHERE short_code = $1
      RETURNING *
    `,
    [shortCode]
  );

  if (result.rowCount === 0) return null;

  cacheDelete(shortCode);
  return result.rows[0];
}

async function getTopUrls(limit = 10) {
  await simulateDbLatency('read');

  const result = await pool.query(
    `
      SELECT * FROM urls
      ORDER BY click_count DESC
      LIMIT $1
    `,
    [limit]
  );

  return result.rows;
}

module.exports = {
  createUrl,
  bulkCreate,
  resolveShortCode,
  getUrlStats,
  getUserUrls,
  updateUrl,
  deleteUrl,
  getTopUrls
};
