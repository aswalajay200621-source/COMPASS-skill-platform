import { NextResponse } from 'next/server';
import { prepare, safeJson } from '../lib/db.js';

// GET /api/opportunities
export async function GET() {
  try {
    const rawProjects = await prepare(`
      SELECT p.*, f.name as faculty_name, f.email as faculty_email, f.department as faculty_dept 
      FROM projects p 
      LEFT JOIN faculties f ON p.faculty_id = f.id
      ORDER BY p.created_at DESC
    `).all();

    const opportunities = rawProjects.map(p => ({
      ...p,
      required_skills: safeJson(p.required_skills)
    }));

    return NextResponse.json({ success: true, opportunities });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
