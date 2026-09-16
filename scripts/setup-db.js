// One-command database setup:  npm run db:setup
// Runs 01_schema.sql, 02_seed.sql and 03_exam_subjects.sql in order.
// This exists so you don't have to use the mysql command line at all.
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const FILES = ['01_schema.sql', '02_seed.sql', '03_exam_subjects.sql'];

(async () => {
  console.log('Connecting to MySQL...');

  let conn;
  try {
    conn = await mysql.createConnection({
      host:     process.env.DB_HOST || 'localhost',
      port:     process.env.DB_PORT || 3306,
      user:     process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true   // needed to run a whole .sql file at once
    });
  } catch (err) {
    console.error('\nCould not connect to MySQL.');
    console.error('Check DB_USER / DB_PASSWORD in your .env file, and that MySQL is running.');
    console.error('Error:', err.message);
    process.exit(1);
  }

  for (const file of FILES) {
    const filePath = path.join(__dirname, '..', 'db', file);
    if (!fs.existsSync(filePath)) {
      console.error(`Missing file: ${filePath}`);
      process.exit(1);
    }
    const sql = fs.readFileSync(filePath, 'utf8');
    process.stdout.write(`Running ${file} ... `);
    try {
      await conn.query(sql);
      console.log('done');
    } catch (err) {
      console.log('FAILED');
      console.error(err.message);
      await conn.end();
      process.exit(1);
    }
  }

  const [rows] = await conn.query(`
    SELECT
      (SELECT COUNT(*) FROM mcq_app.organizations) AS orgs,
      (SELECT COUNT(*) FROM mcq_app.exams)          AS exams,
      (SELECT COUNT(*) FROM mcq_app.subjects)       AS subjects,
      (SELECT COUNT(*) FROM mcq_app.topics)         AS topics
  `);

  const r = rows[0];
  console.log(`\nDatabase "mcq_app" is ready.`);
  console.log(`  ${r.orgs} organizations, ${r.exams} exams, ${r.subjects} subjects, ${r.topics} topics`);
  console.log(`\nNow run:  npm start`);

  await conn.end();
})();
