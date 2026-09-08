const fs = require('fs');
const path = require('path');
const { pool, initPostgresDb } = require('./db_postgres');

async function seedPostgres() {
  console.log('[POSTGRES SEED] Starting PostgreSQL Migration & Seed...');

  await initPostgresDb();

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Seed Skills & Courses Taxonomy
    const seedJsonPath = path.join(__dirname, 'compass_faculty_seed.json');
    if (!fs.existsSync(seedJsonPath)) {
      throw new Error(`Seed JSON file not found at ${seedJsonPath}`);
    }

    const { skillsTaxonomy = [], mentors = [] } = JSON.parse(fs.readFileSync(seedJsonPath, 'utf8'));

    // Insert Taxonomy Skills
    console.log(`[POSTGRES SEED] Merging ${skillsTaxonomy.length} taxonomy skills...`);
    for (const skill of skillsTaxonomy) {
      await client.query(
        `INSERT INTO skills (name, category) 
         VALUES ($1, $2) 
         ON CONFLICT (name) DO NOTHING`,
        [skill.name, 'Canonical Taxonomy']
      );
    }

    // 2. Insert Core Projects
    console.log('[POSTGRES SEED] Seeding initial projects...');
    const projectCheck = await client.query('SELECT COUNT(*) FROM projects');
    if (parseInt(projectCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO projects (title, description, required_skills, difficulty, type) VALUES
        ('Campus Expense & Budget Tracker', 'Build a lightweight personal finance tracker for college students featuring expense categorization, monthly budgets, and interactive chart visualizations.', '["HTML5 / CSS3", "JavaScript / TypeScript", "React / Next.js"]'::jsonb, 'Beginner', 'project'),
        ('Campus Event Management & Ticket Portal', 'Develop an end-to-end event registration portal with QR code ticket generation, automated confirmation emails, and real-time attendance dashboards.', '["HTML5 / CSS3", "JavaScript / TypeScript", "React / Next.js", "Node.js / Express"]'::jsonb, 'Intermediate', 'project'),
        ('Full-Stack Microservices & Analytics Engine', 'Design a enterprise-ready cloud dashboard using Node.js microservices, MongoDB NoSQL database, and containerized Docker infrastructure.', '["JavaScript / TypeScript", "Node.js / Express", "MongoDB", "Amazon Web Services (AWS)"]'::jsonb, 'Advanced', 'project'),
        ('Smart Campus Library & AI Book Recommendation System', 'Engineered an automated book checkout and personalized recommendation engine using PostgreSQL queries and Machine Learning clustering algorithms.', '["Python", "SQL (PostgreSQL, MySQL, SQL Server)", "Machine Learning & Deep Learning (PyTorch, TensorFlow)"]'::jsonb, 'Intermediate', 'project');
      `);
    }

    // 3. Insert 16 Pre-registered Faculty Mentors & Dual POV Accounts
    console.log(`[POSTGRES SEED] Upserting ${mentors.length} faculty mentors...`);
    for (const m of mentors) {
      const email = m.email.trim().toLowerCase();
      const skillsJson = JSON.stringify(m.skills || []);

      // Upsert Faculty Record
      const facRes = await client.query(
        `INSERT INTO faculties (name, email, department, skills, bio, created_at)
         VALUES ($1, $2, $3, $4::jsonb, $5, $6)
         ON CONFLICT (email) 
         DO UPDATE SET name = EXCLUDED.name, skills = EXCLUDED.skills
         RETURNING id`,
        [m.name, email, '', skillsJson, '', new Date(m.registeredAt || Date.now())]
      );
      const facultyId = facRes.rows[0].id;

      // Upsert Dual POV Student Account
      const studentSkillsJson = JSON.stringify((m.skills || []).map(s => typeof s === 'string' ? { name: s, level: 'Advanced' } : s));
      await client.query(
        `INSERT INTO students (name, email, level, career_goal, skills, interests, is_mentor, faculty_id, created_at)
         VALUES ($1, $2, 'Faculty / Mentor', 'Faculty Mentor', $3::jsonb, '[]'::jsonb, 1, $4, $5)
         ON CONFLICT (email)
         DO UPDATE SET is_mentor = 1, faculty_id = $4`,
        [m.name, email, studentSkillsJson, facultyId, new Date(m.registeredAt || Date.now())]
      );
    }

    await client.query('COMMIT');
    console.log('[POSTGRES SEED SUCCESS] PostgreSQL database seeded successfully with all 16 faculty mentors and taxonomy!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[POSTGRES SEED ERROR]', err);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seedPostgres();
}

module.exports = seedPostgres;
