import { Pool } from 'pg';

let pool;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.error('[DB CONFIG ERROR] DATABASE_URL is not defined in process.env!');
      throw new Error('DATABASE_URL environment variable is missing.');
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 3,
    });
    pool.on('error', (err) => {
      console.error('[POSTGRES POOL ERROR]', err);
    });
  }
  return pool;
}

// Helper: Safely parse JSON whether returned as string or native object (PostgreSQL)
export function safeJson(val) {
  if (val === null || val === undefined) return [];
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch (e) { return []; }
  }
  return val;
}

export function query(text, params) {
  return getPool().query(text, params);
}

// Prepare-style helper that mirrors the backend db.prepare() API
export function prepare(sql) {
  const pool = getPool();
  // Replace ? placeholders with $1, $2, ... for PostgreSQL
  let idx = 1;
  const pgSql = sql.replace(/\?/g, () => `$${idx++}`);

  return {
    all: async (...params) => {
      const res = await pool.query(pgSql, params.flat());
      return res.rows;
    },
    get: async (...params) => {
      const res = await pool.query(pgSql, params.flat());
      return res.rows[0] || null;
    },
    run: async (...params) => {
      const res = await pool.query(pgSql, params.flat());
      return {
        lastInsertRowid: res.rows[0]?.id || null,
        changes: res.rowCount,
        id: res.rows[0]?.id || null,
      };
    },
  };
}

export default { prepare, query, safeJson, isPostgres: true };
