/** Entry point: verify config and database, then listen. */
const app = require('./src/app');
const { config, validate } = require('./src/config');
const { verifyConnection } = require('./src/db/pool');
const logger = require('./src/utils/logger');

(async () => {
  const problems = validate();
  problems.forEach(p => logger.warn(p));

  try {
    const examCount = await verifyConnection();
    logger.info(`Database connected — ${examCount} exams in catalogue.`);
  } catch (err) {
    logger.error('DATABASE CONNECTION FAILED:', err.message);
    console.error('\nChecklist:\n  1. Is MySQL running?\n  2. Are DB_USER / DB_PASSWORD correct in .env?\n  3. Have you run:  npm run db:setup\n');
    process.exit(1);
  }

  app.listen(config.port, () => {
    logger.info(`${config.site.name} — Practice Portal running at http://localhost:${config.port}`);
  });
})();
