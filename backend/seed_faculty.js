const fs = require('fs');
const path = require('path');

function parseDateToSQLite(dateStr) {
  if (!dateStr) return new Date().toISOString().slice(0, 19).replace('T', ' ');
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 19).replace('T', ' ');
    // Format YYYY-MM-DD HH:MM:SS
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } catch (err) {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
}

function runSeed(dbInstance) {
  const db = dbInstance || require('./db');
  console.log('[SEED] Starting COMPASS Faculty Seed Script & Skill Taxonomy Merge...');

  const seedPath = path.join(__dirname, 'compass_faculty_seed.json');
  if (!fs.existsSync(seedPath)) {
    console.error(`[SEED ERROR] Seed file not found at ${seedPath}`);
    return;
  }

  const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const { skillsTaxonomy = [], mentors = [] } = seedData;

  // 1. Merge Skills Taxonomy (Matching by name, case-insensitive, reusing existing IDs)
  console.log(`[SEED] Processing ${skillsTaxonomy.length} taxonomy skills...`);
  
  const existingSkills = db.prepare('SELECT id, name FROM skills').all();
  const existingMap = new Map(); // lower(name) -> id
  existingSkills.forEach(s => existingMap.set(s.name.trim().toLowerCase(), s.id));

  const insertSkillStmt = db.prepare('INSERT INTO skills (name, category) VALUES (?, ?)');

  let newSkillsAdded = 0;
  skillsTaxonomy.forEach(taxSkill => {
    const normName = taxSkill.name.trim().toLowerCase();
    if (!existingMap.has(normName)) {
      const category = taxSkill.name.includes('Data') || taxSkill.name.includes('Analytics') ? 'Data & AI'
        : taxSkill.name.includes('Python') || taxSkill.name.includes('Java') || taxSkill.name.includes('C++') || taxSkill.name.includes('C#') ? 'Programming'
        : taxSkill.name.includes('SQL') ? 'Database'
        : 'General';
      const result = insertSkillStmt.run(taxSkill.name, category);
      existingMap.set(normName, result.lastInsertRowid);
      newSkillsAdded++;
    }
  });
  console.log(`[SEED] Skills taxonomy merge completed. New skills added: ${newSkillsAdded}. Total skills in taxonomy: ${existingMap.size}.`);

  // 2. Insert / Update Mentors & Dual-POV User Records
  console.log(`[SEED] Processing ${mentors.length} faculty mentors...`);

  const findFacultyByEmail = db.prepare('SELECT id FROM faculties WHERE LOWER(email) = ?');
  const insertFacultyStmt = db.prepare('INSERT INTO faculties (name, email, department, skills, bio, created_at) VALUES (?, ?, ?, ?, ?, ?)');
  const updateFacultyStmt = db.prepare('UPDATE faculties SET name = ?, department = ?, skills = ?, created_at = ? WHERE id = ?');

  const findStudentByEmail = db.prepare('SELECT id FROM students WHERE LOWER(email) = ?');
  const insertStudentStmt = db.prepare('INSERT INTO students (name, email, level, career_goal, skills, interests, is_mentor, faculty_id, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)');
  const updateStudentStmt = db.prepare('UPDATE students SET name = ?, level = ?, career_goal = ?, skills = ?, is_mentor = 1, faculty_id = ?, created_at = ? WHERE id = ?');

  let mentorsInserted = 0;
  let mentorsUpdated = 0;

  mentors.forEach(m => {
    const cleanEmail = m.email.trim().toLowerCase();
    const formattedCreatedAt = parseDateToSQLite(m.registeredAt);
    const skillsJson = JSON.stringify(m.skills || []);
    const studentSkillsJson = JSON.stringify((m.skills || []).map(s => typeof s === 'string' ? { name: s, level: 'Advanced' } : s));

    // Faculty Record
    const existingFaculty = findFacultyByEmail.get(cleanEmail);
    let facultyId;

    if (existingFaculty) {
      updateFacultyStmt.run(m.name, '', skillsJson, formattedCreatedAt, existingFaculty.id);
      facultyId = existingFaculty.id;
      mentorsUpdated++;
    } else {
      const res = insertFacultyStmt.run(m.name, cleanEmail, '', skillsJson, '', formattedCreatedAt);
      facultyId = res.lastInsertRowid;
      mentorsInserted++;
    }

    // Student POV User Record (Dual POV)
    const existingStudent = findStudentByEmail.get(cleanEmail);
    if (existingStudent) {
      updateStudentStmt.run(m.name, 'Faculty / Mentor', 'Faculty Mentor', studentSkillsJson, facultyId, formattedCreatedAt, existingStudent.id);
    } else {
      insertStudentStmt.run(m.name, cleanEmail, 'Faculty / Mentor', 'Faculty Mentor', studentSkillsJson, '[]', facultyId, formattedCreatedAt);
    }
  });

  console.log(`[SEED SUCCESS] Pre-enrolled Faculty Mentors Seed Complete! Inserted: ${mentorsInserted}, Updated: ${mentorsUpdated}. Total mentors: ${mentors.length}.`);
}

// Run when called directly or required
if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
