import { NextResponse } from 'next/server';
import { prepare, safeJson } from '../../lib/db.js';

// GET /api/portfolio/[studentId]
export async function GET(request, { params }) {
  try {
    const { studentId } = await params;
    const student = await prepare('SELECT * FROM students WHERE id = ?').get(studentId);
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    const studentSkills = safeJson(student.skills);
    const studentInterests = safeJson(student.interests);

    const rawCompleted = await prepare(`
      SELECT sp.*, p.title, p.description, p.required_skills, p.difficulty, p.type, f.name as faculty_mentor_name, f.email as faculty_mentor_email, f.department as faculty_mentor_dept
      FROM student_projects sp
      JOIN projects p ON sp.project_id = p.id
      LEFT JOIN faculties f ON p.faculty_id = f.id
      WHERE sp.student_id = ? AND sp.status = 'completed'
      ORDER BY sp.completed_at DESC
    `).all(studentId);

    const completedProjects = rawCompleted.map(cp => ({
      ...cp,
      required_skills: safeJson(cp.required_skills),
      skills_acquired: safeJson(cp.skills_acquired)
    }));

    const mentorships = await prepare(`
      SELECT mr.*, f.name as faculty_name, f.department, f.email as faculty_email, p.title as project_title
      FROM mentorship_requests mr
      JOIN faculties f ON mr.faculty_id = f.id
      JOIN projects p ON mr.project_id = p.id
      WHERE mr.student_id = ?
    `).all(studentId);

    return NextResponse.json({
      success: true,
      portfolio: {
        student: {
          id: student.id, name: student.name, email: student.email, level: student.level,
          careerGoal: student.career_goal, skills: studentSkills, interests: studentInterests, memberSince: student.created_at
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
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
