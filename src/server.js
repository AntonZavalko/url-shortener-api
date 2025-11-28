const app = require('./app');
const { PORT, SERVER_ID } = require('./config/env');

app.listen(PORT, () => {
  console.log(`URL Shortener API listening on port ${PORT}`);
  console.log(`SERVER_ID: ${SERVER_ID}`);
});
