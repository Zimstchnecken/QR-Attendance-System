import { Pool } from 'pg';

import { env } from '../config/env.js';

let pool: Pool | undefined;

export function getDatabasePool() {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  if (!pool) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
    });
  }

  return pool;
}

export async function verifyDatabaseConnection() {
  const databasePool = getDatabasePool();
  const result = await databasePool.query('select 1 as ok');
  return result.rowCount === 1;
}