const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function init() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Database schema initialized');
  } catch (err) {
    console.error('Failed to init schema', err);
  } finally {
    await pool.end();
  }
}

init();
