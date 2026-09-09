import { NextResponse } from 'next/server';
import { prepare, safeJson } from '../../../lib/db.js';

// PUT /api/faculties/[facultyId]/skills
export async function PUT(request, { params }) {
  try {
    const { facultyId } = await params;
    const { skills } = await request.json();

    if (!skills || !Array.isArray(skills)) {
      return NextResponse.json({ success: false, error: 'Skills array is required.' }, { status: 400 });
    }

    const skillsVal = JSON.stringify(skills);
    await prepare('UPDATE faculties SET skills = ?::jsonb WHERE id = ?').run(skillsVal, facultyId);

    const faculty = await prepare('SELECT * FROM faculties WHERE id = ?').get(facultyId);
    faculty.skills = safeJson(faculty.skills);

    return NextResponse.json({ success: true, faculty, message: 'Mentor skills updated successfully! Matching engine updated.' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
