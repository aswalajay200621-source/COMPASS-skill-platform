import { NextResponse } from 'next/server';
import { prepare, safeJson } from '../lib/db.js';
import { computeSkillGapAndChain } from '../lib/prerequisiteChainFinder.js';
import { explainSkillGapAI } from '../lib/matchingEngine.js';

// GET /api/skill-gap?studentId=...&projectId=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const projectId = searchParams.get('projectId');

    if (!studentId || !projectId) {
      return NextResponse.json({ success: false, error: 'studentId and projectId query parameters are required.' }, { status: 400 });
    }

    const gapAnalysis = await computeSkillGapAndChain(studentId, projectId);
    const student = await prepare('SELECT name FROM students WHERE id = ?').get(studentId);
    const missingSkills = gapAnalysis.gapSkills || [];
    const aiExplanation = await explainSkillGapAI(missingSkills, student?.name || 'Student');

    const normalizedChain = (gapAnalysis.prerequisiteChain || []).map(step => ({
      ...step,
      courseTitle: step.course?.title || `Learn ${step.skillName}`,
      provider: step.course?.provider || 'NPTEL',
      duration: step.course?.duration || '6 Weeks',
      link: step.course?.link || 'https://onlinecourses.nptel.ac.in/'
    }));

    return NextResponse.json({ success: true, data: { ...gapAnalysis, missingSkills, prerequisiteChain: normalizedChain, aiExplanation } });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
