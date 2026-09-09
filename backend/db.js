const dotenv = require('dotenv');
dotenv.config();

const isPostgres = process.env.DB_TYPE === 'postgres' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgresql'));

let dbExport;

if (isPostgres) {
  console.log('[DB] Connecting to PostgreSQL Database via Supabase/PostgreSQL Pool...');
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') 
      ? { rejectUnauthorized: false } 
      : false
  });

  function convertSql(sql) {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
  }

  dbExport = {
    isPostgres: true,
    pool,
    prepare: (sql) => {
      const pgSql = convertSql(sql);
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
            lastInsertRowid: res.rows[0]?.id || res.oid || null,
            changes: res.rowCount
          };
        }
      };
    }
  };
} else {
  console.log('[DB] Connecting to local SQLite Database (compass.db)...');
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const dbPath = path.join(__dirname, 'compass.db');
  const sqliteDb = new sqlite3.Database(dbPath);
  sqliteDb.run('PRAGMA foreign_keys = ON');

  dbExport = {
    isPostgres: false,
    sqliteDb,
    prepare: (sql) => {
      const cleanSql = sql.replace(/::jsonb/gi, '');
      return {
        all: (...params) => new Promise((resolve, reject) => {
          sqliteDb.all(cleanSql, params.flat(), (err, rows) => {
            if (err) reject(err); else resolve(rows || []);
          });
        }),
        get: (...params) => new Promise((resolve, reject) => {
          sqliteDb.get(cleanSql, params.flat(), (err, row) => {
            if (err) reject(err); else resolve(row || null);
          });
        }),
        run: (...params) => new Promise((resolve, reject) => {
          sqliteDb.run(cleanSql, params.flat(), function(err) {
            if (err) reject(err); else resolve({ lastInsertRowid: this.lastID, changes: this.changes });
          });
        })
      };
    }
  };
}

module.exports = dbExport;
