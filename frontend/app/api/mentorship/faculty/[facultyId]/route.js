import { NextResponse } from 'next/server';
import { prepare, safeJson } from '../../../lib/db.js';

// GET /api/mentorship/faculty/[facultyId]
export async function GET(request, { params }) {
  try {
    const { facultyId } = await params;
    const rawRequests = await prepare(`
      SELECT mr.*, s.name as student_name, s.email as student_email, s.level as student_level, s.skills as student_skills, p.title as project_title, p.required_skills as project_required_skills 
      FROM mentorship_requests mr
      JOIN students s ON mr.student_id = s.id
      JOIN projects p ON mr.project_id = p.id
      WHERE mr.faculty_id = ?
      ORDER BY mr.created_at DESC
    `).all(facultyId);

    const requests = rawRequests.map(r => ({
      ...r,
      student_skills: safeJson(r.student_skills),
      project_required_skills: safeJson(r.project_required_skills)
    }));

    return NextResponse.json({ success: true, requests });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
