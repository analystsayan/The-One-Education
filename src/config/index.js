/**
 * Single source of truth for configuration.
 * Everything reads from here — no process.env scattered across the codebase.
 */
require('dotenv').config();

const config = {
  env:  process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  site: {
    name:   process.env.SITE_NAME || 'The One Education',
    domain: process.env.SITE_DOMAIN || 'quiz-the-one-education.vercel.app',
  },

  db: {
    host:     process.env.DB_HOST || 'localhost',
    port:     parseInt(process.env.DB_PORT, 10) || 3306,
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Pass@123',
    database: process.env.DB_NAME || 'mcq_app'
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model:  process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models'
  },

  quiz: {
    allowedCounts: [25, 50, 100],
    allowedLevels: ['Easy', 'Medium', 'Hard'],
    // Large quizzes are generated in batches — one API call per batch.
    batchSize: 25,
    // How many batches run at the same time. Kept low so the free-tier
    // requests-per-minute limit isn't tripped.
    batchConcurrency: 2,
    maxCount: 100
  }
};

/** Warn loudly at startup rather than failing mid-request. */
function validate() {
  const problems = [];
  if (!config.gemini.apiKey) problems.push('GEMINI_API_KEY is not set');
  if (!config.db.database)   problems.push('DB_NAME is not set');
  return problems;
}

module.exports = { config, validate };
