const dotenv = require('dotenv');
const os = require('os');

dotenv.config();

module.exports = {
  PORT: process.env.PORT || 3000,
  SERVER_ID: process.env.SERVER_ID || os.hostname(),
  CACHE_ENABLED: process.env.CACHE_ENABLED !== 'false',
  DATABASE_URL: process.env.DATABASE_URL,
  BASE_URL: process.env.BASE_URL || "http://localhost:3000"
};
