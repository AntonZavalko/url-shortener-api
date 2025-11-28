const express = require('express');

const { requestLogger } = require('./middlewares/logging');
const { chaosMonkey } = require('./middlewares/chaos');
const { errorHandler } = require('./middlewares/errorHandler');

const healthRoutes = require('./routes/healthRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const chaosRoutes = require('./routes/chaosRoutes');
const urlRoutes = require('./routes/urlRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

app.use(express.json());

app.use(requestLogger);

app.use(chaosMonkey);

app.use('/health', healthRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/chaos', chaosRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/', urlRoutes); 

app.use(errorHandler);

module.exports = app;
