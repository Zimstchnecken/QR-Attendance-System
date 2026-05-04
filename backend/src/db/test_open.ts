import { getDatabasePool } from './pool.js';

async function testOpenSession() {
  const pool = getDatabasePool();
  try {
    const sectionSubjectId = '99999999-9999-9999-9999-999999999999'; // Mathematics
    const sessionDate = new Date().toISOString().slice(0, 10);

    const result = await pool.query(
      `insert into class_sessions (section_subject_id, session_date, status, opened_at)
       values ($1, $2, 'open', now())
       returning id, status, opened_at`,
      [sectionSubjectId, sessionDate]
    );

    console.log('Successfully opened session:', result.rows[0]);
  } catch (error) {
    console.error('Failed to open session:', error);
  } finally {
    await pool.end();
  }
}

testOpenSession();
