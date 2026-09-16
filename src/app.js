/** Express application. Kept separate from server.js so it can be tested. */
const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: false,          // Tailwind + Google Fonts come from CDNs
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(express.json({ limit: '128kb' }));

app.use('/api', routes);

app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));

// Clean URLs for the two pages.
app.get('/',     (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
app.get('/quiz', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'quiz.html')));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
