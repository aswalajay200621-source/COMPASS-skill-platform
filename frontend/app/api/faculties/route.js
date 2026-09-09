import { NextResponse } from 'next/server';
import { prepare, safeJson } from '../lib/db.js';

export async function GET() {
  try {
    const rawFaculties = await prepare('SELECT * FROM faculties').all();
    const faculties = rawFaculties.map(f => ({
      ...f,
      skills: safeJson(f.skills)
    }));
    return NextResponse.json({ success: true, faculties });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
