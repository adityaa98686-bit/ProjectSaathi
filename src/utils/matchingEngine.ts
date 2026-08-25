import { 
  UserProfile, 
  Project, 
  MatchBreakdown, 
  RadarDataPoint, 
  AvailabilityStatus, 
  ExperienceLevel 
} from '../types';

/**
 * Computes the 0-100% Match Score between a Contributor Profile and a Project
 * Based on:
 * - Skill overlap (40%)
 * - Role fit (20%)
 * - Availability (15%)
 * - Experience level fit (15%)
 * - Interest/domain overlap (10%)
 */
export function computeMatchScore(user: UserProfile, project: Project, targetRoleId?: string): MatchBreakdown {
  const userSkillNames = user.skills.map(s => s.name.toLowerCase().trim());
  const projectSkillNames = project.requiredSkills.map(s => s.toLowerCase().trim());

  // 1. Skill Overlap (40% weight)
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  const openRoles = project.openRoles || [];
  const requiredSkills = project.requiredSkills || [];

  requiredSkills.forEach(reqSkill => {
    const isMatched = userSkillNames.some(uSkill => 
      uSkill === reqSkill.toLowerCase().trim() ||
      uSkill.includes(reqSkill.toLowerCase().trim()) ||
      reqSkill.toLowerCase().trim().includes(uSkill)
    );
    if (isMatched) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const skillMatchRatio = requiredSkills.length > 0
    ? matchedSkills.length / requiredSkills.length
    : 1;
  const skillScore = Math.min(100, Math.round(skillMatchRatio * 100));

  // 2. Role Fit (20% weight)
  let roleFitScore = 50; // baseline
  const userRole = (user.primaryRole || '').toLowerCase();
  
  if (targetRoleId) {
    const role = openRoles.find(r => r.id === targetRoleId);
    if (role) {
      const roleTitle = (role.title || '').toLowerCase();
      const roleCategory = (role.category || '').toLowerCase();
      if (userRole.includes(roleCategory) || roleCategory.includes(userRole) || userRole.includes(roleTitle) || roleTitle.includes(userRole)) {
        roleFitScore = 100;
      } else {
        // Check if user has skills required by that specific role
        const roleReqSkills = role.requiredSkills || [];
        const roleSkillMatches = roleReqSkills.filter(rs => 
          userSkillNames.some(us => us.includes(rs.toLowerCase()) || rs.toLowerCase().includes(us))
        );
        roleFitScore = roleReqSkills.length > 0 
          ? Math.round((roleSkillMatches.length / roleReqSkills.length) * 90) + 10 
          : 70;
      }
    }
  } else {
    // Check match against any open role
    const hasMatchingRole = openRoles.some(r => {
      const rCat = (r.category || '').toLowerCase();
      const rTitle = (r.title || '').toLowerCase();
      return userRole.includes(rCat) || rCat.includes(userRole) || userRole.includes(rTitle) || rTitle.includes(userRole);
    });
    roleFitScore = hasMatchingRole ? 100 : Math.max(40, skillScore > 60 ? 80 : 50);
  }

  // 3. Availability (15% weight)
  let availabilityScore = 30;
  if (user.availability === 'available') {
    availabilityScore = 100;
  } else if (user.availability === 'open_to_explore') {
    availabilityScore = 75;
  } else {
    availabilityScore = 25;
  }

  // 4. Experience Level Fit (15% weight)
  const levelRanks: Record<ExperienceLevel, number> = {
    'Beginner': 1,
    'Intermediate': 2,
    'Advanced': 3,
    'Lead': 4,
  };
  const userRank = levelRanks[user.experienceLevel] || 2;
  const projectRank = levelRanks[project.difficulty] || 2;
  const diff = userRank - projectRank;
  
  let experienceFitScore = 80;
  if (diff === 0) {
    experienceFitScore = 100; // Perfect match
  } else if (diff === 1) {
    experienceFitScore = 95; // Overqualified slightly is great
  } else if (diff === 2) {
    experienceFitScore = 90;
  } else if (diff === -1) {
    experienceFitScore = 70; // Slightly junior but can grow
  } else {
    experienceFitScore = 45; // Significant gap
  }

  // 5. Interest / Domain Overlap (10% weight)
  const userInterests = user.interests.map(i => i.toLowerCase());
  const projectDomainLower = project.domain.toLowerCase();
  
  const hasDirectDomainMatch = userInterests.some(i => 
    projectDomainLower.includes(i) || i.includes(projectDomainLower) ||
    (projectDomainLower.includes('ai') && (i.includes('ai') || i.includes('machine learning') || i.includes('llm'))) ||
    (projectDomainLower.includes('fintech') && (i.includes('finance') || i.includes('crypto') || i.includes('payment'))) ||
    (projectDomainLower.includes('climate') && (i.includes('sustainability') || i.includes('clean') || i.includes('energy'))) ||
    (projectDomainLower.includes('health') && (i.includes('bio') || i.includes('med') || i.includes('fitness')))
  );

  const interestScore = hasDirectDomainMatch ? 100 : (userInterests.length > 0 ? 55 : 40);

  // Overall Weighted Score
  const rawScore = (
    skillScore * 0.40 +
    roleFitScore * 0.20 +
    availabilityScore * 0.15 +
    experienceFitScore * 0.15 +
    interestScore * 0.10
  );

  const overallScore = Math.min(99, Math.max(12, Math.round(rawScore)));

  // Generate plain-English explanation
  const explanation = generateExplanation(
    overallScore, 
    matchedSkills, 
    missingSkills, 
    user.availability, 
    user.experienceLevel, 
    project.difficulty, 
    project.domain, 
    hasDirectDomainMatch
  );

  const quickHighlight = matchedSkills.length > 0 
    ? `${matchedSkills.slice(0, 2).join(' & ')} overlap • ${user.availability === 'available' ? 'Available now' : 'Exploring'}`
    : `Strong domain alignment in ${project.domain}`;

  return {
    overallScore,
    skillOverlapScore: skillScore,
    roleFitScore,
    availabilityScore,
    experienceFitScore,
    interestOverlapScore: interestScore,
    matchedSkills,
    missingSkills,
    explanation,
    quickHighlight,
  };
}

function generateExplanation(
  score: number,
  matched: string[],
  missing: string[],
  availability: AvailabilityStatus,
  userLevel: ExperienceLevel,
  projectLevel: ExperienceLevel,
  domain: string,
  hasDomainMatch: boolean
): string {
  const skillPart = matched.length > 0
    ? `Strong match on ${matched.slice(0, 3).join(', ')}${missing.length > 0 ? ` (needs ${missing.slice(0, 2).join(', ')})` : ''}.`
    : `Complementary perspective for the team stack.`;

  const availPart = availability === 'available'
    ? 'Ready to commit immediately.'
    : availability === 'open_to_explore'
    ? 'Open to exploring the right fit.'
    : 'Currently occupied with limited bandwidth.';

  const domainPart = hasDomainMatch
    ? `Shared passion for ${domain}.`
    : `Brings fresh cross-disciplinary eyes to ${domain}.`;

  return `${skillPart} ${availPart} ${domainPart}`;
}

/**
 * Skill Gap Radar computation
 * Evaluates the required skill archetypes vs skills covered by current accepted team members
 */
export function computeTeamSkillGapRadar(project: Project): RadarDataPoint[] {
  const categories = [
    { name: 'Frontend', keywords: ['react', 'next.js', 'vue', 'tailwind', 'typescript', 'css', 'html', 'frontend', 'ui'] },
    { name: 'Backend', keywords: ['node', 'python', 'go', 'rust', 'express', 'django', 'fastapi', 'sql', 'postgresql', 'backend', 'api'] },
    { name: 'AI / ML', keywords: ['python', 'pytorch', 'tensorflow', 'gemini', 'llm', 'nlp', 'langchain', 'ai', 'machine learning', 'data'] },
    { name: 'UI / UX', keywords: ['figma', 'ui/ux', 'wireframing', 'prototyping', 'user research', 'design systems', 'design'] },
    { name: 'Product', keywords: ['product management', 'roadmapping', 'strategy', 'agile', 'scrum', 'user stories', 'growth'] },
    { name: 'DevOps', keywords: ['docker', 'kubernetes', 'aws', 'gcp', 'ci/cd', 'terraform', 'cloud', 'security'] },
  ];

  // Combine all skills from owner + accepted team members
  const allTeamSkills: string[] = [
    ...project.owner.skills.map(s => s.name.toLowerCase()),
    ...project.team.flatMap(m => m.user.skills.map(s => s.name.toLowerCase())),
  ];

  const projectSkillsLower = project.requiredSkills.map(s => s.toLowerCase());

  return categories.map(cat => {
    // How much does the project require this dimension?
    const reqMatches = cat.keywords.filter(kw => 
      projectSkillsLower.some(ps => ps.includes(kw) || kw.includes(ps)) ||
      project.openRoles.some(r => r.category.toLowerCase().includes(kw) || r.title.toLowerCase().includes(kw))
    );
    const requiredScore = Math.min(100, Math.max(30, reqMatches.length * 35 + 20));

    // How much does the current team cover this dimension?
    const coverMatches = cat.keywords.filter(kw =>
      allTeamSkills.some(ts => ts.includes(kw) || kw.includes(ts))
    );
    const coveredScore = Math.min(100, Math.round((coverMatches.length / 3) * 100));

    return {
      dimension: cat.name,
      required: requiredScore,
      covered: coveredScore,
    };
  });
}

/**
 * Contributor Skill Radar computation
 */
export function computeUserSkillRadar(user: UserProfile): RadarDataPoint[] {
  const categories = [
    { name: 'Frontend', keywords: ['react', 'next.js', 'vue', 'tailwind', 'typescript', 'css', 'html', 'frontend', 'ui'] },
    { name: 'Backend', keywords: ['node', 'python', 'go', 'rust', 'express', 'django', 'fastapi', 'sql', 'postgresql', 'backend', 'api'] },
    { name: 'AI / ML', keywords: ['python', 'pytorch', 'tensorflow', 'gemini', 'llm', 'nlp', 'langchain', 'ai', 'machine learning', 'data'] },
    { name: 'UI / UX', keywords: ['figma', 'ui/ux', 'wireframing', 'prototyping', 'user research', 'design systems', 'design'] },
    { name: 'Product', keywords: ['product management', 'roadmapping', 'strategy', 'agile', 'scrum', 'user stories', 'growth'] },
    { name: 'DevOps', keywords: ['docker', 'kubernetes', 'aws', 'gcp', 'ci/cd', 'terraform', 'cloud', 'security'] },
  ];

  const userSkillsLower = user.skills.map(s => s.name.toLowerCase());

  return categories.map(cat => {
    const matches = cat.keywords.filter(kw =>
      userSkillsLower.some(us => us.includes(kw) || kw.includes(us))
    );
    const score = Math.min(100, Math.max(15, Math.round((matches.length / 2.5) * 100)));
    return {
      dimension: cat.name,
      required: 100,
      covered: score,
    };
  });
}
