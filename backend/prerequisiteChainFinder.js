const db = require('./db');

/**
 * Deterministic Prerequisite Chain Lookup (SQL / Graph Traversal)
 * Computes gap_skills = project.required_skills - student.skills
 * Recursively resolves prerequisite chains via skills.prerequisite_skill_id.
 */

function getPrerequisiteChainForSkill(targetSkillName) {
  const chain = [];
  let currentSkill = db.prepare(`
    SELECT s1.id, s1.name, s1.category, s1.prerequisite_skill_id, s2.name as prerequisite_name 
    FROM skills s1 
    LEFT JOIN skills s2 ON s1.prerequisite_skill_id = s2.id 
    WHERE LOWER(s1.name) = LOWER(?)
  `).get(targetSkillName);

  const visitedIds = new Set();

  while (currentSkill && !visitedIds.has(currentSkill.id)) {
    visitedIds.add(currentSkill.id);

    // Fetch linked course for currentSkill
    const course = db.prepare('SELECT title, provider, duration, link FROM courses WHERE skill_id = ?').get(currentSkill.id);

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
      currentSkill = db.prepare(`
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

function computeSkillGapAndChain(studentId, projectId) {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
  if (!student) {
    throw new Error(`Student with ID ${studentId} not found`);
  }

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  if (!project) {
    throw new Error(`Project with ID ${projectId} not found`);
  }

  const studentSkills = JSON.parse(student.skills || '[]');
  const requiredSkills = JSON.parse(project.required_skills || '[]');

  const studentSkillNamesSet = new Set(
    studentSkills.map(s => (typeof s === 'string' ? s : s.name).trim().toLowerCase())
  );

  // Set difference: project required skills - student skills
  const gapSkills = requiredSkills.filter(
    reqSkill => !studentSkillNamesSet.has(reqSkill.trim().toLowerCase())
  );

  const fullChainMap = new Map();

  gapSkills.forEach(gapSkill => {
    const singleSkillChain = getPrerequisiteChainForSkill(gapSkill);
    singleSkillChain.forEach(step => {
      // If student does NOT already possess this skill, add to chain map
      if (!studentSkillNamesSet.has(step.skillName.toLowerCase())) {
        if (!fullChainMap.has(step.skillId)) {
          const hasPrereqInStudentProfile = step.prerequisiteSkillName 
            ? studentSkillNamesSet.has(step.prerequisiteSkillName.toLowerCase())
            : true;

          fullChainMap.set(step.skillId, {
            ...step,
            studentHasPrerequisite: hasPrereqInStudentProfile
          });
        }
      }
    });
  });

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

module.exports = {
  getPrerequisiteChainForSkill,
  computeSkillGapAndChain
};
