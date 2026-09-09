/**
 * Deterministic Set-Intersection Matching Engine for COMPASS
 * No AI/ML used for core matching. Pure mathematical set overlap.
 */

function isSkillMatch(hasSkill, reqSkill) {
  const normA = hasSkill.trim().toLowerCase();
  const normB = reqSkill.trim().toLowerCase();
  if (normA === normB) return true;
  if (normA.includes(normB) || normB.includes(normA)) return true;

  const aliases = [
    ['python', 'python'],
    ['sql', 'database', 'postgresql', 'mysql', 'sql server'],
    ['html', 'css', 'html5', 'css3'],
    ['javascript', 'typescript', 'js'],
    ['react', 'next.js', 'react.js'],
    ['node.js', 'express', 'node'],
    ['machine learning', 'deep learning', 'pytorch', 'tensorflow', 'ml'],
    ['c++', 'c'],
    ['c#', '.net']
  ];

  for (const group of aliases) {
    const aMatch = group.some(term => normA.includes(term));
    const bMatch = group.some(term => normB.includes(term));
    if (aMatch && bMatch) return true;
  }
  return false;
}

export function calculateSkillMatch(userSkills, requiredSkills) {
  if (!requiredSkills || !Array.isArray(requiredSkills) || requiredSkills.length === 0) {
    return { matchPercentage: 100, matchedSkills: [], missingSkills: [], totalRequired: 0 };
  }

  const userSkillList = (userSkills || []).map(s => {
    if (typeof s === 'string') return s;
    if (s && s.name) return s.name;
    return '';
  }).filter(Boolean);

  const matchedSkills = [];
  const missingSkills = [];

  requiredSkills.forEach(reqSkill => {
    const found = userSkillList.some(userSkill => isSkillMatch(userSkill, reqSkill));
    if (found) { matchedSkills.push(reqSkill); } else { missingSkills.push(reqSkill); }
  });

  const matchPercentage = Math.round((matchedSkills.length / requiredSkills.length) * 100);
  return { matchPercentage, matchedSkills, missingSkills, totalRequired: requiredSkills.length };
}

export function findBestMentorForProject(projectRequiredSkills, faculties = []) {
  if (!faculties || faculties.length === 0 || !projectRequiredSkills || projectRequiredSkills.length === 0) {
    return null;
  }

  const matches = faculties.map(faculty => {
    const facultySkills = Array.isArray(faculty.skills) ? faculty.skills : JSON.parse(faculty.skills || '[]');
    const match = calculateSkillMatch(facultySkills, projectRequiredSkills);
    return { faculty, matchPercentage: match.matchPercentage, matchedSkills: match.matchedSkills, totalRequired: projectRequiredSkills.length };
  }).filter(m => m.matchedSkills.length > 0)
    .sort((a, b) => b.matchPercentage - a.matchPercentage);

  return matches.length > 0 ? matches[0] : null;
}

export async function explainSkillGapAI(missingSkills, studentName) {
  return {
    isAiGenerated: false,
    explanation: `Hi ${studentName}, to unlock this project you need to master ${missingSkills.length} prerequisite skill${missingSkills.length > 1 ? 's' : ''}: ${missingSkills.join(', ')}. Follow your staged learning path below step-by-step!`
  };
}
