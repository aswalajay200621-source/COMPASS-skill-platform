import { NextResponse } from 'next/server';
import { prepare } from '../../lib/db.js';

// POST /api/mentorship/respond
export async function POST(request) {
  try {
    const { request_id, status } = await request.json();

    if (!request_id || !['accepted', 'declined'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Valid request_id and status ("accepted" or "declined") are required.' }, { status: 400 });
    }

    await prepare('UPDATE mentorship_requests SET status = ? WHERE id = ?').run(status, request_id);
    const req = await prepare('SELECT * FROM mentorship_requests WHERE id = ?').get(request_id);

    if (status === 'accepted' && req) {
      const existingProject = await prepare('SELECT id FROM student_projects WHERE student_id = ? AND project_id = ?').get(req.student_id, req.project_id);
      if (!existingProject) {
        await prepare('INSERT INTO student_projects (student_id, project_id, status) VALUES (?, ?, \'enrolled\')').run(req.student_id, req.project_id);
      }
    }

    return NextResponse.json({ success: true, request: req, message: `Mentorship request ${status} successfully!` });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
