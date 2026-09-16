const logger = require('../utils/logger');
const { config } = require('../config');

/** 404 for unmatched API routes. */
function notFound(req, res, next) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint not found.' });
  }
  next();
}

/** Final error handler — the only place that formats an error response. */
function errorHandler(err, req, res, _next) {
  const status = err.isApiError ? err.status : 500;

  if (status >= 500) {
    logger.error(`${req.method} ${req.path} →`, err.message);
  } else {
    logger.warn(`${req.method} ${req.path} → ${status}:`, err.message);
  }

  res.status(status).json({
    error: err.isApiError ? err.message : 'Something went wrong. Please try again.',
    ...(config.env === 'development' && status >= 500 ? { detail: err.message } : {})
  });
}

module.exports = { notFound, errorHandler };
