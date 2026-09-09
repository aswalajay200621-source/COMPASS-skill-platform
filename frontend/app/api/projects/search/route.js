import { NextResponse } from 'next/server';
import { prepare, safeJson } from '../../lib/db.js';
import { calculateSkillMatch } from '../../lib/matchingEngine.js';

// GET /api/projects/search?q=...&studentId=...&category=...&level=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const studentId = searchParams.get('studentId');
    const category = searchParams.get('category');
    const level = searchParams.get('level');

    let studentSkills = [];
    if (studentId) {
      const student = await prepare('SELECT skills FROM students WHERE id = ?').get(studentId);
      if (student) studentSkills = safeJson(student.skills);
    }

    const query = q ? q.trim().toLowerCase() : '';
    const projects = await prepare(`
      SELECT p.*, f.name as faculty_name, f.email as faculty_email, f.department as faculty_dept 
      FROM projects p 
      LEFT JOIN faculties f ON p.faculty_id = f.id
      ORDER BY p.created_at DESC
    `).all();

    const filtered = projects.map(proj => {
      const requiredSkills = safeJson(proj.required_skills);
      const matchResult = calculateSkillMatch(studentSkills, requiredSkills);
      return { ...proj, required_skills: requiredSkills, matchPercentage: matchResult.matchPercentage, matchedSkills: matchResult.matchedSkills, missingSkills: matchResult.missingSkills };
    }).filter(proj => {
      if (level && level !== 'ALL' && proj.difficulty.toLowerCase() !== level.toLowerCase()) return false;
      if (category && category !== 'ALL' && proj.type.toLowerCase() !== category.toLowerCase()) return false;
      if (!query) return true;
      const titleMatch = proj.title.toLowerCase().includes(query);
      const descMatch = proj.description.toLowerCase().includes(query);
      const skillMatch = proj.required_skills.some(s => s.toLowerCase().includes(query));
      return titleMatch || descMatch || skillMatch;
    });

    return NextResponse.json({ success: true, projects: filtered });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
