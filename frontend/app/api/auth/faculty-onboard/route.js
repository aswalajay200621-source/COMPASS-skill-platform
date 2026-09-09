import { NextResponse } from 'next/server';
import { prepare, safeJson } from '../../lib/db.js';

function isCollegeEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const lower = email.trim().toLowerCase();
  return lower.endsWith('.edu') || lower.includes('@college.edu') || lower.includes('@student.') || lower.includes('.ac.');
}

// POST /api/auth/faculty-onboard
export async function POST(request) {
  try {
    const { name, email, department, skills, bio, studentId } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ success: false, error: 'Name and College Email are required.' }, { status: 400 });
    }

    if (!isCollegeEmail(email)) {
      return NextResponse.json({ success: false, error: 'Invalid Faculty Email: Must be a college institutional email (.edu / .ac).' }, { status: 400 });
    }

    const skillsVal = JSON.stringify(skills || []);
    const existing = await prepare('SELECT id FROM faculties WHERE LOWER(email) = LOWER(?)').get(email.trim());
    let facultyId;

    if (existing) {
      await prepare('UPDATE faculties SET name = ?, department = ?, skills = ?::jsonb, bio = ? WHERE id = ?')
        .run(name, department || '', skillsVal, bio || '', existing.id);
      facultyId = existing.id;
    } else {
      const result = await prepare('INSERT INTO faculties (name, email, department, skills, bio) VALUES (?, ?, ?, ?::jsonb, ?) RETURNING id')
        .run(name, email.trim().toLowerCase(), department || '', skillsVal, bio || '');
      facultyId = result.lastInsertRowid || result.id;
    }

    if (studentId) {
      await prepare('UPDATE students SET is_mentor = 1, faculty_id = ? WHERE id = ?').run(facultyId, studentId);
    }

    const faculty = await prepare('SELECT * FROM faculties WHERE id = ?').get(facultyId);
    faculty.skills = safeJson(faculty.skills);

    return NextResponse.json({ success: true, faculty, message: 'Faculty mentor registration complete! Mentor POV unlocked.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
