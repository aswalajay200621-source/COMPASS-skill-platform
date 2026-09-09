import { NextResponse } from 'next/server';
import { prepare, safeJson } from '../../lib/db.js';

// POST /api/projects/complete
export async function POST(request) {
  try {
    const { student_id, project_id, github_link, skills_acquired } = await request.json();

    if (!student_id || !project_id) {
      return NextResponse.json({ success: false, error: 'student_id and project_id are required.' }, { status: 400 });
    }

    const existing = await prepare('SELECT id FROM student_projects WHERE student_id = ? AND project_id = ?').get(student_id, project_id);
    const newSkills = skills_acquired || [];
    const skillsVal = JSON.stringify(newSkills);
    const now = new Date().toISOString();

    if (existing) {
      await prepare('UPDATE student_projects SET status = \'completed\', github_link = ?, skills_acquired = ?::jsonb, completed_at = ? WHERE id = ?')
        .run(github_link || '', skillsVal, now, existing.id);
    } else {
      await prepare('INSERT INTO student_projects (student_id, project_id, status, github_link, skills_acquired, completed_at) VALUES (?, ?, \'completed\', ?, ?::jsonb, ?)')
        .run(student_id, project_id, github_link || '', skillsVal, now);
    }

    const student = await prepare('SELECT * FROM students WHERE id = ?').get(student_id);
    let currentSkills = safeJson(student.skills);
    const skillSet = new Set(currentSkills.map(s => (typeof s === 'string' ? s : s.name).trim().toLowerCase()));

    newSkills.forEach(skillName => {
      if (!skillSet.has(skillName.trim().toLowerCase())) {
        currentSkills.push({ name: skillName, level: 'Intermediate' });
        skillSet.add(skillName.trim().toLowerCase());
      }
    });

    await prepare('UPDATE students SET skills = ?::jsonb WHERE id = ?').run(JSON.stringify(currentSkills), student_id);

    return NextResponse.json({ success: true, message: 'Project completed! Background portfolio feeder updated automatically with verified skills gained.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
