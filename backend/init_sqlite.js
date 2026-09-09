const db = require('./db');
const runSeed = require('./seed_faculty');

async function initSqlite() {
  console.log('[INIT DB] Initializing SQLite database schema...');

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT,
      prerequisite_skill_id INTEGER REFERENCES skills(id) ON DELETE SET NULL
    );
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      provider TEXT NOT NULL,
      duration TEXT,
      link TEXT NOT NULL
    );
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS faculties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      department TEXT,
      skills TEXT NOT NULL DEFAULT '[]',
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      level TEXT NOT NULL,
      career_goal TEXT,
      skills TEXT NOT NULL DEFAULT '[]',
      interests TEXT NOT NULL DEFAULT '[]',
      is_mentor INTEGER DEFAULT 0,
      faculty_id INTEGER REFERENCES faculties(id) ON DELETE SET NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      required_skills TEXT NOT NULL DEFAULT '[]',
      difficulty TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'project',
      faculty_id INTEGER REFERENCES faculties(id) ON DELETE SET NULL,
      apply_by_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS mentorship_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      faculty_id INTEGER NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'pending',
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `).run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS student_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'enrolled',
      github_link TEXT,
      skills_acquired TEXT DEFAULT '[]',
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `).run();

  console.log('[INIT DB] Tables created/verified successfully!');

  // Seed initial projects if empty
  const projectCheck = await db.prepare('SELECT COUNT(*) as count FROM projects').get();
  if (!projectCheck || projectCheck.count === 0) {
    console.log('[INIT DB] Seeding initial sample projects...');
    const initialProjects = [
      {
        title: 'Campus Expense & Budget Tracker',
        description: 'Build a lightweight personal finance tracker for college students featuring expense categorization, monthly budgets, and interactive chart visualizations.',
        required_skills: JSON.stringify(["HTML5 / CSS3", "JavaScript / TypeScript", "React / Next.js"]),
        difficulty: 'Beginner',
        type: 'project'
      },
      {
        title: 'Campus Event Management & Ticket Portal',
        description: 'Develop an end-to-end event registration portal with QR code ticket generation, automated confirmation emails, and real-time attendance dashboards.',
        required_skills: JSON.stringify(["HTML5 / CSS3", "JavaScript / TypeScript", "React / Next.js", "Node.js / Express"]),
        difficulty: 'Intermediate',
        type: 'project'
      },
      {
        title: 'Full-Stack Microservices & Analytics Engine',
        description: 'Design a enterprise-ready cloud dashboard using Node.js microservices, MongoDB NoSQL database, and containerized Docker infrastructure.',
        required_skills: JSON.stringify(["JavaScript / TypeScript", "Node.js / Express", "MongoDB", "Amazon Web Services (AWS)"]),
        difficulty: 'Advanced',
        type: 'project'
      },
      {
        title: 'Smart Campus Library & AI Book Recommendation System',
        description: 'Engineered an automated book checkout and personalized recommendation engine using PostgreSQL queries and Machine Learning clustering algorithms.',
        required_skills: JSON.stringify(["Python", "SQL (PostgreSQL, MySQL, SQL Server)", "Machine Learning & Deep Learning (PyTorch, TensorFlow)"]),
        difficulty: 'Intermediate',
        type: 'project'
      }
    ];

    for (const proj of initialProjects) {
      await db.prepare('INSERT INTO projects (title, description, required_skills, difficulty, type) VALUES (?, ?, ?, ?, ?)')
        .run(proj.title, proj.description, proj.required_skills, proj.difficulty, proj.type);
    }
  }

  // Seed Faculty and Taxonomy
  await runSeed(db);
  console.log('[INIT DB SUCCESS] Database ready!');
}

initSqlite().catch(err => {
  console.error('[INIT DB ERROR]', err);
});
