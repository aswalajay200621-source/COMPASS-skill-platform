import { prepare, safeJson } from './db.js';

/**
 * Deterministic Prerequisite Chain Lookup (SQL / Graph Traversal)
 * Async version for Next.js API routes using PostgreSQL.
 */

async function getPrerequisiteChainForSkill(targetSkillName) {
  const chain = [];

  let currentSkill = await prepare(`
    SELECT s1.id, s1.name, s1.category, s1.prerequisite_skill_id, s2.name as prerequisite_name 
    FROM skills s1 
    LEFT JOIN skills s2 ON s1.prerequisite_skill_id = s2.id 
    WHERE LOWER(s1.name) = LOWER(?)
  `).get(targetSkillName);

  const visitedIds = new Set();

  while (currentSkill && !visitedIds.has(currentSkill.id)) {
    visitedIds.add(currentSkill.id);

    const course = await prepare('SELECT title, provider, duration, link FROM courses WHERE skill_id = ?').get(currentSkill.id);

    chain.unshift({
      skillId: currentSkill.id,
      skillName: currentSkill.name,
      category: currentSkill.category,
      prerequisiteSkillId: currentSkill.prerequisite_skill_id,
      prerequisiteSkillName: currentSkill.prerequisite_name || null,
      course: course || {
        title: `NPTEL / Open Courseware: ${currentSkill.name} Mastery`,
        provider: 'NPTEL',
        duration: '6 Weeks',
        link: 'https://onlinecourses.nptel.ac.in/'
      }
    });

    if (currentSkill.prerequisite_skill_id) {
      currentSkill = await prepare(`
        SELECT s1.id, s1.name, s1.category, s1.prerequisite_skill_id, s2.name as prerequisite_name 
        FROM skills s1 
        LEFT JOIN skills s2 ON s1.prerequisite_skill_id = s2.id 
        WHERE s1.id = ?
      `).get(currentSkill.prerequisite_skill_id);
    } else {
      break;
    }
  }

  return chain;
}

export async function computeSkillGapAndChain(studentId, projectId) {
  const student = await prepare('SELECT * FROM students WHERE id = ?').get(studentId);
  if (!student) throw new Error(`Student with ID ${studentId} not found`);

  const project = await prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  if (!project) throw new Error(`Project with ID ${projectId} not found`);

  const studentSkills = safeJson(student.skills);
  const requiredSkills = safeJson(project.required_skills);

  const studentSkillNamesSet = new Set(
    studentSkills.map(s => (typeof s === 'string' ? s : s.name).trim().toLowerCase())
  );

  const gapSkills = requiredSkills.filter(
    reqSkill => !studentSkillNamesSet.has(reqSkill.trim().toLowerCase())
  );

  const fullChainMap = new Map();

  for (const gapSkill of gapSkills) {
    const singleSkillChain = await getPrerequisiteChainForSkill(gapSkill);
    singleSkillChain.forEach(step => {
      if (!studentSkillNamesSet.has(step.skillName.toLowerCase())) {
        if (!fullChainMap.has(step.skillId)) {
          const hasPrereqInStudentProfile = step.prerequisiteSkillName
            ? studentSkillNamesSet.has(step.prerequisiteSkillName.toLowerCase())
            : true;
          fullChainMap.set(step.skillId, { ...step, studentHasPrerequisite: hasPrereqInStudentProfile });
        }
      }
    });
  }

  const orderedChain = Array.from(fullChainMap.values()).map((item, index) => ({
    stepNumber: index + 1,
    skillId: item.skillId,
    skillName: item.skillName,
    prerequisiteSkillName: item.prerequisiteSkillName,
    studentHasPrerequisite: item.studentHasPrerequisite,
    course: item.course
  }));

  return {
    projectId: project.id,
    projectTitle: project.title,
    studentId: student.id,
    studentName: student.name,
    studentLevel: student.level,
    gapSkills,
    prerequisiteChain: orderedChain
  };
}
