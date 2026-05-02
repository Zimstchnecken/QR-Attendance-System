import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { getDatabasePool } from './pool.js';

type MigrationRow = {
  filename: string;
};

async function ensureMigrationsTable() {
  const pool = getDatabasePool();
  await pool.query(`
    create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `);
}

async function getAppliedMigrations() {
  const pool = getDatabasePool();
  const result = await pool.query<MigrationRow>('select filename from schema_migrations order by filename asc');
  return new Set(result.rows.map((row) => row.filename));
}

async function applyMigration(filename: string, sql: string) {
  const pool = getDatabasePool();
  const client = await pool.connect();

  try {
    await client.query('begin');
    await client.query(sql);
    await client.query('insert into schema_migrations (filename) values ($1)', [filename]);
    await client.query('commit');
    console.log(`Applied migration ${filename}`);
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  const migrationsDirectory = path.resolve(process.cwd(), 'db', 'migrations');
  const files = (await readdir(migrationsDirectory))
    .filter((file) => file.endsWith('.sql'))
    .sort((left, right) => left.localeCompare(right));

  if (files.length === 0) {
    console.log('No SQL migrations found.');
    return;
  }

  await ensureMigrationsTable();
  const appliedMigrations = await getAppliedMigrations();

  for (const filename of files) {
    if (appliedMigrations.has(filename)) {
      console.log(`Skipping already applied migration ${filename}`);
      continue;
    }

    const migrationPath = path.join(migrationsDirectory, filename);
    const sql = await readFile(migrationPath, 'utf8');
    await applyMigration(filename, sql);
  }

  await getDatabasePool().end();
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  try {
    await getDatabasePool().end();
  } catch {
    // Ignore shutdown errors.
  }
  process.exit(1);
});