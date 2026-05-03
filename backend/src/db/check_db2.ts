import { getDatabasePool } from './pool.js';

async function checkDb() {
  const pool = getDatabasePool();
  try {
    const cs = await pool.query('SELECT * FROM class_sessions ORDER BY created_at DESC LIMIT 5');
    console.log('class_sessions:', cs.rows);

    const ar = await pool.query('SELECT * FROM attendance_records ORDER BY created_at DESC LIMIT 5');
    console.log('attendance_records:', ar.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}

checkDb();
