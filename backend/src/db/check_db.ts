import { getDatabasePool } from './pool.js';

async function checkDb() {
  const pool = getDatabasePool();
  try {
    const res = await pool.query('SELECT * FROM class_sessions ORDER BY opened_at DESC LIMIT 5');
    console.log('Recent class_sessions:', res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

checkDb();
