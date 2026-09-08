const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL Connection Pool configuration
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/compass_db';

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') 
    ? { rejectUnauthorized: false } 
    : false
});

pool.on('error', (err) => {
  console.error('[POSTGRES POOL ERROR]', err);
});

async function initPostgresDb() {
  console.log('[POSTGRES] Initializing COMPASS PostgreSQL Database...');
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        category VARCHAR(255),
        prerequisite_skill_id INTEGER REFERENCES skills(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        duration VARCHAR(100),
        link TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS faculties (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        department VARCHAR(255),
        skills JSONB NOT NULL DEFAULT '[]'::jsonb,
        bio TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        level VARCHAR(100) NOT NULL,
        career_goal TEXT,
        skills JSONB NOT NULL DEFAULT '[]'::jsonb,
        interests JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_mentor INTEGER DEFAULT 0,
        faculty_id INTEGER REFERENCES faculties(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
        difficulty VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'project',
        faculty_id INTEGER REFERENCES faculties(id) ON DELETE SET NULL,
        apply_by_date VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS mentorship_requests (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        faculty_id INTEGER NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS student_projects (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'enrolled',
        github_link TEXT,
        skills_acquired JSONB DEFAULT '[]'::jsonb,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[POSTGRES] Tables initialized successfully!');
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initPostgresDb
};
