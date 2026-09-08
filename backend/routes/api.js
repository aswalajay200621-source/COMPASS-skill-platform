const express = require('express');
const router = express.Router();
const db = require('../db');
const { calculateSkillMatch, findBestMentorForProject, explainSkillGapAI } = require('../matchingEngine');
const { computeSkillGapAndChain } = require('../prerequisiteChainFinder');

// Helper: Safely parse JSON whether returned as string (SQLite) or native object (PostgreSQL)
function safeJson(val) {
  if (val === null || val === undefined) return [];
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch (e) { return []; }
  }
  return val;
}

// Helper: Email validation for College domain
function isCollegeEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const lower = email.trim().toLowerCase();
  return lower.endsWith('.edu') || lower.includes('@college.edu') || lower.includes('@student.') || lower.includes('.ac.');
}

// 1. GET /api/skills - Available Canonical Skills Taxonomy
router.get('/skills', async (req, res) => {
  try {
    const skills = await db.prepare(`
      SELECT s1.id, s1.name, s1.category, s1.prerequisite_skill_id, s2.name as prerequisite_name 
      FROM skills s1 
      LEFT JOIN skills s2 ON s1.prerequisite_skill_id = s2.id
      ORDER BY s1.name ASC
    `).all();
    res.json({ success: true, skills });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. POST /api/auth/signup-student - Student Signup + Skill Profile Creation
router.post('/auth/signup-student', async (req, res) => {
  try {
    const { name, email, level, career_goal, skills, interests } = req.body;

    if (!name || !email || !level) {
      return res.status(400).json({ success: false, error: 'Name, College Email, and Academic Level are required.' });
    }

    if (!isCollegeEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid Email: Please use a valid college email address ending in .edu, .ac, or your institution domain.' });
    }

    const skillsVal = db.isPostgres ? JSON.stringify(skills || []) : JSON.stringify(skills || []);
    const interestsVal = db.isPostgres ? JSON.stringify(interests || []) : JSON.stringify(interests || []);

    const existing = await db.prepare('SELECT id FROM students WHERE LOWER(email) = LOWER(?)').get(email.trim());
    let studentId;

    if (existing) {
      await db.prepare('UPDATE students SET name = ?, level = ?, career_goal = ?, skills = ?::jsonb, interests = ?::jsonb WHERE id = ?')
        .run(name, level, career_goal || '', skillsVal, interestsVal, existing.id);
      studentId = existing.id;
    } else {
      const result = await db.prepare('INSERT INTO students (name, email, level, career_goal, skills, interests) VALUES (?, ?, ?, ?, ?::jsonb, ?::jsonb) RETURNING id')
        .run(name, email.trim().toLowerCase(), level, career_goal || '', skillsVal, interestsVal);
      studentId = result.lastInsertRowid || result.id;
    }

    const student = await db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
    student.skills = safeJson(student.skills);
    student.interests = safeJson(student.interests);

    res.json({ success: true, student, message: 'Student skill profile saved successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /api/auth/faculty-onboard - Faculty / Mentor Onboarding Form
router.post('/auth/faculty-onboard', async (req, res) => {
  try {
    const { name, email, department, skills, bio, studentId } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and College Email are required.' });
    }

    if (!isCollegeEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid Faculty Email: Must be a college institutional email (.edu / .ac).' });
    }

    const skillsVal = JSON.stringify(skills || []);
    const existing = await db.prepare('SELECT id FROM faculties WHERE LOWER(email) = LOWER(?)').get(email.trim());
    let facultyId;

    if (existing) {
      await db.prepare('UPDATE faculties SET name = ?, department = ?, skills = ?::jsonb, bio = ? WHERE id = ?')
        .run(name, department || '', skillsVal, bio || '', existing.id);
      facultyId = existing.id;
    } else {
      const result = await db.prepare('INSERT INTO faculties (name, email, department, skills, bio) VALUES (?, ?, ?, ?::jsonb, ?) RETURNING id')
        .run(name, email.trim().toLowerCase(), department || '', skillsVal, bio || '');
      facultyId = result.lastInsertRowid || result.id;
    }

    if (studentId) {
      await db.prepare('UPDATE students SET is_mentor = 1, faculty_id = ? WHERE id = ?').run(facultyId, studentId);
    }

    const faculty = await db.prepare('SELECT * FROM faculties WHERE id = ?').get(facultyId);
    faculty.skills = safeJson(faculty.skills);

    res.json({ success: true, faculty, message: 'Faculty mentor registration complete! Mentor POV unlocked.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. PUT /api/faculties/:facultyId/skills - Mentor Edit Registered Skills
router.put('/faculties/:facultyId/skills', async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ success: false, error: 'Skills array is required.' });
    }

    const skillsVal = JSON.stringify(skills);
    await db.prepare('UPDATE faculties SET skills = ?::jsonb WHERE id = ?').run(skillsVal, facultyId);

    const faculty = await db.prepare('SELECT * FROM faculties WHERE id = ?').get(facultyId);
    faculty.skills = safeJson(faculty.skills);

    res.json({ success: true, faculty, message: 'Mentor skills updated successfully! Matching engine updated.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. GET /api/projects/matched/:studentId - Deterministic Skill-Overlap Project Ranking
router.get('/projects/matched/:studentId', async (req, res) => {
  try {
    const student = await db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.studentId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const studentSkills = safeJson(student.skills);
    const projects = await db.prepare(`
      SELECT p.*, f.name as faculty_name, f.email as faculty_email, f.department as faculty_dept 
      FROM projects p 
      LEFT JOIN faculties f ON p.faculty_id = f.id
      ORDER BY p.created_at DESC
    `).all();

    const rawFaculties = await db.prepare('SELECT * FROM faculties').all();
    const allFaculties = rawFaculties.map(f => ({
      ...f,
      skills: safeJson(f.skills)
    }));

    const rankedProjects = projects.map(proj => {
      const requiredSkills = safeJson(proj.required_skills);
      const matchResult = calculateSkillMatch(studentSkills, requiredSkills);

      const matchingFaculties = allFaculties.map(faculty => {
        const facultyMatch = calculateSkillMatch(faculty.skills, requiredSkills);
        return {
          id: faculty.id,
          name: faculty.name,
          email: faculty.email,
          department: faculty.department,
          matchPercentage: facultyMatch.matchPercentage,
          matchedSkills: facultyMatch.matchedSkills,
          totalRequired: requiredSkills.length,
          summaryLine: `${facultyMatch.matchedSkills.length} of ${requiredSkills.length} skills match`
        };
      }).filter(f => f.matchPercentage > 0)
        .sort((a, b) => b.matchPercentage - a.matchPercentage);

      const bestMentorMatch = findBestMentorForProject(requiredSkills, allFaculties);

      return {
        ...proj,
        required_skills: requiredSkills,
        matchPercentage: matchResult.matchPercentage,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        bestMentor: bestMentorMatch ? {
          ...bestMentorMatch.faculty,
          matchPercentage: bestMentorMatch.matchPercentage,
          matchedSkills: bestMentorMatch.matchedSkills,
          summaryLine: `${bestMentorMatch.matchedSkills.length} of ${requiredSkills.length} skills match`
        } : null,
        surfacedFaculties: matchingFaculties
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({
      success: true,
      studentId: student.id,
      studentName: student.name,
      projects: rankedProjects
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. GET /api/projects/search - Real-time Project Search
router.get('/projects/search', async (req, res) => {
  try {
    const { q, studentId, category, level } = req.query;
    
    let studentSkills = [];
    if (studentId) {
      const student = await db.prepare('SELECT skills FROM students WHERE id = ?').get(studentId);
      if (student) {
        studentSkills = safeJson(student.skills);
      }
    }

    const query = q ? q.trim().toLowerCase() : '';
    const projects = await db.prepare(`
      SELECT p.*, f.name as faculty_name, f.email as faculty_email, f.department as faculty_dept 
      FROM projects p 
      LEFT JOIN faculties f ON p.faculty_id = f.id
      ORDER BY p.created_at DESC
    `).all();

    const filtered = projects.map(proj => {
      const requiredSkills = safeJson(proj.required_skills);
      const matchResult = calculateSkillMatch(studentSkills, requiredSkills);

      return {
        ...proj,
        required_skills: requiredSkills,
        matchPercentage: matchResult.matchPercentage,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills
      };
    }).filter(proj => {
      if (level && level !== 'ALL' && proj.difficulty.toLowerCase() !== level.toLowerCase()) return false;
      if (category && category !== 'ALL' && proj.type.toLowerCase() !== category.toLowerCase()) return false;
      if (!query) return true;

      const titleMatch = proj.title.toLowerCase().includes(query);
      const descMatch = proj.description.toLowerCase().includes(query);
      const skillMatch = proj.required_skills.some(s => s.toLowerCase().includes(query));
      return titleMatch || descMatch || skillMatch;
    });

    res.json({ success: true, projects: filtered });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. GET /api/skill-gap - Prerequisite Chain Lookup
router.get('/skill-gap', async (req, res) => {
  try {
    const { studentId, projectId } = req.query;

    if (!studentId || !projectId) {
      return res.status(400).json({ success: false, error: 'studentId and projectId query parameters are required.' });
    }

    const gapAnalysis = computeSkillGapAndChain(studentId, projectId);
    const student = await db.prepare('SELECT name FROM students WHERE id = ?').get(studentId);
    const missingSkills = gapAnalysis.gapSkills || [];
    const aiExplanation = await explainSkillGapAI(missingSkills, student?.name || 'Student');

    const normalizedChain = (gapAnalysis.prerequisiteChain || []).map(step => ({
      ...step,
      courseTitle: step.course?.title || `Learn ${step.skillName}`,
      provider: step.course?.provider || 'NPTEL',
      duration: step.course?.duration || '6 Weeks',
      link: step.course?.link || 'https://onlinecourses.nptel.ac.in/'
    }));

    res.json({
      success: true,
      data: {
        ...gapAnalysis,
        missingSkills,
        prerequisiteChain: normalizedChain,
        aiExplanation
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. POST /api/mentorship/request - Send Mentorship Request
router.post('/mentorship/request', async (req, res) => {
  try {
    const { student_id, faculty_id, project_id, message } = req.body;

    if (!student_id || !faculty_id || !project_id) {
      return res.status(400).json({ success: false, error: 'student_id, faculty_id, and project_id are required.' });
    }

    const existing = await db.prepare('SELECT id FROM mentorship_requests WHERE student_id = ? AND faculty_id = ? AND project_id = ? AND status = "pending"').get(student_id, faculty_id, project_id);
    if (existing) {
      return res.status(400).json({ success: false, error: 'A pending mentorship request already exists for this project.' });
    }

    const result = await db.prepare('INSERT INTO mentorship_requests (student_id, faculty_id, project_id, message) VALUES (?, ?, ?, ?) RETURNING id')
      .run(student_id, faculty_id, project_id, message || 'I am interested in working on this project under your mentorship.');

    const requestId = result.lastInsertRowid || result.id;
    const request = await db.prepare('SELECT * FROM mentorship_requests WHERE id = ?').get(requestId);

    res.json({
      success: true,
      request,
      notification: 'Mentorship request sent successfully! The faculty member has been notified.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. GET /api/mentorship/faculty/:facultyId - Faculty Inbox
router.get('/mentorship/faculty/:facultyId', async (req, res) => {
  try {
    const rawRequests = await db.prepare(`
      SELECT mr.*, s.name as student_name, s.email as student_email, s.level as student_level, s.skills as student_skills, p.title as project_title, p.required_skills as project_required_skills 
      FROM mentorship_requests mr
      JOIN students s ON mr.student_id = s.id
      JOIN projects p ON mr.project_id = p.id
      WHERE mr.faculty_id = ?
      ORDER BY mr.created_at DESC
    `).all(req.params.facultyId);

    const requests = rawRequests.map(r => ({
      ...r,
      student_skills: safeJson(r.student_skills),
      project_required_skills: safeJson(r.project_required_skills)
    }));

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. POST /api/mentorship/respond - Accept or Decline Request
router.post('/mentorship/respond', async (req, res) => {
  try {
    const { request_id, status } = req.body;

    if (!request_id || !['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Valid request_id and status ("accepted" or "declined") are required.' });
    }

    await db.prepare('UPDATE mentorship_requests SET status = ? WHERE id = ?').run(status, request_id);
    const request = await db.prepare('SELECT * FROM mentorship_requests WHERE id = ?').get(request_id);

    if (status === 'accepted' && request) {
      const existingProject = await db.prepare('SELECT id FROM student_projects WHERE student_id = ? AND project_id = ?').get(request.student_id, request.project_id);
      if (!existingProject) {
        await db.prepare('INSERT INTO student_projects (student_id, project_id, status) VALUES (?, ?, "enrolled")')
          .run(request.student_id, request.project_id);
      }
    }

    res.json({ success: true, request, message: `Mentorship request ${status} successfully!` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. POST /api/opportunities/post - Post New Opportunity
router.post('/opportunities/post', async (req, res) => {
  try {
    const { faculty_id, title, description, required_skills, difficulty, type, apply_by_date } = req.body;

    if (!faculty_id || !title || !description || !required_skills) {
      return res.status(400).json({ success: false, error: 'faculty_id, title, description, and required_skills are required.' });
    }

    const skillsVal = JSON.stringify(required_skills || []);
    const result = await db.prepare('INSERT INTO projects (title, description, required_skills, difficulty, type, faculty_id, apply_by_date) VALUES (?, ?, ?::jsonb, ?, ?, ?, ?) RETURNING id')
      .run(title, description, skillsVal, difficulty || 'Intermediate', type || 'project', faculty_id, apply_by_date || null);

    const projectId = result.lastInsertRowid || result.id;
    const project = await db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    project.required_skills = safeJson(project.required_skills);

    res.json({ success: true, project, message: 'New project opportunity posted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. GET /api/opportunities - List Opportunities
router.get('/opportunities', async (req, res) => {
  try {
    const rawProjects = await db.prepare(`
      SELECT p.*, f.name as faculty_name, f.email as faculty_email, f.department as faculty_dept 
      FROM projects p 
      LEFT JOIN faculties f ON p.faculty_id = f.id
      ORDER BY p.created_at DESC
    `).all();

    const opportunities = rawProjects.map(p => ({
      ...p,
      required_skills: safeJson(p.required_skills)
    }));

    res.json({ success: true, opportunities });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. POST /api/projects/complete - Mark Project Completed
router.post('/projects/complete', async (req, res) => {
  try {
    const { student_id, project_id, github_link, skills_acquired } = req.body;

    if (!student_id || !project_id) {
      return res.status(400).json({ success: false, error: 'student_id and project_id are required.' });
    }

    const existing = await db.prepare('SELECT id FROM student_projects WHERE student_id = ? AND project_id = ?').get(student_id, project_id);
    const newSkills = skills_acquired || [];
    const skillsVal = JSON.stringify(newSkills);
    const now = new Date().toISOString();

    if (existing) {
      await db.prepare('UPDATE student_projects SET status = "completed", github_link = ?, skills_acquired = ?::jsonb, completed_at = ? WHERE id = ?')
        .run(github_link || '', skillsVal, now, existing.id);
    } else {
      await db.prepare('INSERT INTO student_projects (student_id, project_id, status, github_link, skills_acquired, completed_at) VALUES (?, ?, "completed", ?, ?::jsonb, ?)')
        .run(student_id, project_id, github_link || '', skillsVal, now);
    }

    const student = await db.prepare('SELECT * FROM students WHERE id = ?').get(student_id);
    let currentSkills = safeJson(student.skills);
    const skillSet = new Set(currentSkills.map(s => (typeof s === 'string' ? s : s.name).trim().toLowerCase()));

    newSkills.forEach(skillName => {
      if (!skillSet.has(skillName.trim().toLowerCase())) {
        currentSkills.push({ name: skillName, level: 'Intermediate' });
        skillSet.add(skillName.trim().toLowerCase());
      }
    });

    await db.prepare('UPDATE students SET skills = ?::jsonb WHERE id = ?').run(JSON.stringify(currentSkills), student_id);

    res.json({
      success: true,
      message: 'Project completed! Background portfolio feeder updated automatically with verified skills gained.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. GET /api/portfolio/:studentId - Generate Portfolio Report
router.get('/portfolio/:studentId', async (req, res) => {
  try {
    const student = await db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.studentId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const studentSkills = safeJson(student.skills);
    const studentInterests = safeJson(student.interests);

    const rawCompleted = await db.prepare(`
      SELECT sp.*, p.title, p.description, p.required_skills, p.difficulty, p.type, f.name as faculty_mentor_name, f.email as faculty_mentor_email, f.department as faculty_mentor_dept
      FROM student_projects sp
      JOIN projects p ON sp.project_id = p.id
      LEFT JOIN faculties f ON p.faculty_id = f.id
      WHERE sp.student_id = ? AND sp.status = 'completed'
      ORDER BY sp.completed_at DESC
    `).all(req.params.studentId);

    const completedProjects = rawCompleted.map(cp => ({
      ...cp,
      required_skills: safeJson(cp.required_skills),
      skills_acquired: safeJson(cp.skills_acquired)
    }));

    const mentorships = await db.prepare(`
      SELECT mr.*, f.name as faculty_name, f.department, f.email as faculty_email, p.title as project_title
      FROM mentorship_requests mr
      JOIN faculties f ON mr.faculty_id = f.id
      JOIN projects p ON mr.project_id = p.id
      WHERE mr.student_id = ?
    `).all(req.params.studentId);

    res.json({
      success: true,
      portfolio: {
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          level: student.level,
          careerGoal: student.career_goal,
          skills: studentSkills,
          interests: studentInterests,
          memberSince: student.created_at
        },
        stats: {
          totalCompletedProjects: completedProjects.length,
          totalSkillsMastered: studentSkills.length,
          totalFacultyMentorships: mentorships.length
        },
        completedProjects,
        mentorships,
        shareableUrl: `/portfolio/share/${student.id}`
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15. GET /api/students - List Students
router.get('/students', async (req, res) => {
  try {
    const rawStudents = await db.prepare('SELECT * FROM students').all();
    const students = rawStudents.map(s => ({
      ...s,
      skills: safeJson(s.skills),
      interests: safeJson(s.interests)
    }));
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 16. GET /api/faculties - List Faculty Mentors
router.get('/faculties', async (req, res) => {
  try {
    const rawFaculties = await db.prepare('SELECT * FROM faculties').all();
    const faculties = rawFaculties.map(f => ({
      ...f,
      skills: safeJson(f.skills)
    }));
    res.json({ success: true, faculties });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
