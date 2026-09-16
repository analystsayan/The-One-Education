/** MySQL connection pool. Created once, reused for every query. */
const mysql = require('mysql2/promise');
const { config } = require('../config');

const pool = mysql.createPool({
  ...config.db,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci'
});

/** Runs at startup so connection problems surface immediately. */
async function verifyConnection() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT COUNT(*) AS n FROM exams');
    return rows[0].n;
  } finally {
    conn.release();
  }
}

module.exports = { pool, verifyConnection };
