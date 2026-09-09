import { NextResponse } from 'next/server';
import { prepare } from '../lib/db.js';

export async function GET() {
  try {
    const skills = await prepare(`
      SELECT s1.id, s1.name, s1.category, s1.prerequisite_skill_id, s2.name as prerequisite_name 
      FROM skills s1 
      LEFT JOIN skills s2 ON s1.prerequisite_skill_id = s2.id
      ORDER BY s1.name ASC
    `).all();
    return NextResponse.json({ success: true, skills });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
