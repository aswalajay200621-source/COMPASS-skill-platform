import { NextResponse } from 'next/server';
import { prepare } from '../../lib/db.js';

// POST /api/mentorship/request
export async function POST(request) {
  try {
    const { student_id, faculty_id, project_id, message } = await request.json();

    if (!student_id || !faculty_id || !project_id) {
      return NextResponse.json({ success: false, error: 'student_id, faculty_id, and project_id are required.' }, { status: 400 });
    }

    const existing = await prepare('SELECT id FROM mentorship_requests WHERE student_id = ? AND faculty_id = ? AND project_id = ? AND status = \'pending\'').get(student_id, faculty_id, project_id);
    if (existing) {
      return NextResponse.json({ success: false, error: 'A pending mentorship request already exists for this project.' }, { status: 400 });
    }

    const result = await prepare('INSERT INTO mentorship_requests (student_id, faculty_id, project_id, message) VALUES (?, ?, ?, ?) RETURNING id')
      .run(student_id, faculty_id, project_id, message || 'I am interested in working on this project under your mentorship.');

    const requestId = result.lastInsertRowid || result.id;
    const req = await prepare('SELECT * FROM mentorship_requests WHERE id = ?').get(requestId);

    return NextResponse.json({ success: true, request: req, notification: 'Mentorship request sent successfully! The faculty member has been notified.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
