import { NextResponse } from 'next/server';
import { prepare, safeJson } from '../../lib/db.js';

// POST /api/opportunities/post
export async function POST(request) {
  try {
    const { faculty_id, title, description, required_skills, difficulty, type, apply_by_date } = await request.json();

    if (!faculty_id || !title || !description || !required_skills) {
      return NextResponse.json({ success: false, error: 'faculty_id, title, description, and required_skills are required.' }, { status: 400 });
    }

    const skillsVal = JSON.stringify(required_skills || []);
    const result = await prepare('INSERT INTO projects (title, description, required_skills, difficulty, type, faculty_id, apply_by_date) VALUES (?, ?, ?::jsonb, ?, ?, ?, ?) RETURNING id')
      .run(title, description, skillsVal, difficulty || 'Intermediate', type || 'project', faculty_id, apply_by_date || null);

    const projectId = result.lastInsertRowid || result.id;
    const project = await prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    project.required_skills = safeJson(project.required_skills);

    return NextResponse.json({ success: true, project, message: 'New project opportunity posted successfully!' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
