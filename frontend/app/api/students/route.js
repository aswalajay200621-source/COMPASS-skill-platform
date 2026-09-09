import { NextResponse } from 'next/server';
import { prepare, safeJson } from '../lib/db.js';

export async function GET() {
  try {
    const rawStudents = await prepare('SELECT * FROM students').all();
    const students = rawStudents.map(s => ({
      ...s,
      skills: safeJson(s.skills),
      interests: safeJson(s.interests)
    }));
    return NextResponse.json({ success: true, students });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
