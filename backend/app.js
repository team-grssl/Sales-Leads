const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { frontendDir } = require('./utils/config');
const apiRoutes = require('./routes');
const { notFound } = require('./Middleware/not-found');
const { errorHandler } = require('./Middleware/error-handler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(express.static(frontendDir));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;


