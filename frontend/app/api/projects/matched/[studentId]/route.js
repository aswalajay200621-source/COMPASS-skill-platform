import { NextResponse } from 'next/server';
import { prepare, safeJson } from '../../../lib/db.js';
import { calculateSkillMatch, findBestMentorForProject } from '../../../lib/matchingEngine.js';

// GET /api/projects/matched/[studentId]
export async function GET(request, { params }) {
  try {
    const { studentId } = await params;
    const student = await prepare('SELECT * FROM students WHERE id = ?').get(studentId);
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    const studentSkills = safeJson(student.skills);
    const projects = await prepare(`
      SELECT p.*, f.name as faculty_name, f.email as faculty_email, f.department as faculty_dept 
      FROM projects p 
      LEFT JOIN faculties f ON p.faculty_id = f.id
      ORDER BY p.created_at DESC
    `).all();

    const rawFaculties = await prepare('SELECT * FROM faculties').all();
    const allFaculties = rawFaculties.map(f => ({ ...f, skills: safeJson(f.skills) }));

    const rankedProjects = projects.map(proj => {
      const requiredSkills = safeJson(proj.required_skills);
      const matchResult = calculateSkillMatch(studentSkills, requiredSkills);

      const matchingFaculties = allFaculties.map(faculty => {
        const facultyMatch = calculateSkillMatch(faculty.skills, requiredSkills);
        return {
          id: faculty.id, name: faculty.name, email: faculty.email, department: faculty.department,
          matchPercentage: facultyMatch.matchPercentage, matchedSkills: facultyMatch.matchedSkills,
          totalRequired: requiredSkills.length,
          summaryLine: `${facultyMatch.matchedSkills.length} of ${requiredSkills.length} skills match`
        };
      }).filter(f => f.matchPercentage > 0).sort((a, b) => b.matchPercentage - a.matchPercentage);

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

    return NextResponse.json({ success: true, studentId: student.id, studentName: student.name, projects: rankedProjects });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
