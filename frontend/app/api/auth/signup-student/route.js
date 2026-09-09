import { NextResponse } from 'next/server';
import { prepare, safeJson } from '../../lib/db.js';

function isCollegeEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const lower = email.trim().toLowerCase();
  return lower.endsWith('.edu') || lower.includes('@college.edu') || lower.includes('@student.') || lower.includes('.ac.');
}

// POST /api/auth/signup-student
export async function POST(request) {
  try {
    const { name, email, level, career_goal, skills, interests } = await request.json();

    if (!name || !email || !level) {
      return NextResponse.json({ success: false, error: 'Name, College Email, and Academic Level are required.' }, { status: 400 });
    }

    if (!isCollegeEmail(email)) {
      return NextResponse.json({ success: false, error: 'Invalid Email: Please use a valid college email address ending in .edu, .ac, or your institution domain.' }, { status: 400 });
    }

    const skillsVal = JSON.stringify(skills || []);
    const interestsVal = JSON.stringify(interests || []);

    const existing = await prepare('SELECT id FROM students WHERE LOWER(email) = LOWER(?)').get(email.trim());
    let studentId;

    if (existing) {
      await prepare('UPDATE students SET name = ?, level = ?, career_goal = ?, skills = ?::jsonb, interests = ?::jsonb WHERE id = ?')
        .run(name, level, career_goal || '', skillsVal, interestsVal, existing.id);
      studentId = existing.id;
    } else {
      const result = await prepare('INSERT INTO students (name, email, level, career_goal, skills, interests) VALUES (?, ?, ?, ?, ?::jsonb, ?::jsonb) RETURNING id')
        .run(name, email.trim().toLowerCase(), level, career_goal || '', skillsVal, interestsVal);
      studentId = result.lastInsertRowid || result.id;
    }

    const student = await prepare('SELECT * FROM students WHERE id = ?').get(studentId);
    student.skills = safeJson(student.skills);
    student.interests = safeJson(student.interests);

    return NextResponse.json({ success: true, student, message: 'Student skill profile saved successfully!' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
