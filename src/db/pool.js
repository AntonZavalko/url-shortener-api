const { Pool } = require('pg');
const { DATABASE_URL } = require('../config/env');

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL
});

module.exports = pool;
