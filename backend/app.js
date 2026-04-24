const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { frontendDir } = require('./utils/config');
const apiRoutes = require('./routes');
const { notFound } = require('./Middleware/not-found');
const { errorHandler } = require('./Middleware/error-handler');

const app = express();
const pageRoutes = {
  '/': 'index.html',
  '/login': 'Login.html',
  '/dashboard': 'dashboard.html',
  '/owner-leads': 'owner_leads.html',
  '/add-lead': 'add_lead.html',
  '/review-leads': 'review_leads.html',
  '/manage-leads': 'manage_leads.html',
  '/clients': 'clients.html',
  '/reports': 'reports.html',
  '/profile': 'profile.html'
};

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(express.static(frontendDir));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', apiRoutes);

Object.entries(pageRoutes).forEach(([route, fileName]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(frontendDir, fileName));
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;


