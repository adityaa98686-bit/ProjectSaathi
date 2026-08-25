import { Skill, PastProject } from '../types';

export function calculateProfileCompleteness(profile: {
  headline?: string;
  bio?: string;
  skills?: Skill[];
  interests?: string[];
  availability?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  pastProjects?: PastProject[];
}): { percentage: number; label: string; missingSteps: string[] } {
  let score = 0;
  const missingSteps: string[] = [];

  if (profile.headline && profile.headline.length > 5) {
    score += 15;
  } else {
    missingSteps.push('Add a professional headline');
  }

  if (profile.bio && profile.bio.length > 15) {
    score += 15;
  } else {
    missingSteps.push('Add a brief bio');
  }

  if (profile.skills && profile.skills.length >= 4) {
    score += 25;
  } else {
    missingSteps.push(`Add ${4 - (profile.skills?.length || 0)} more skills`);
  }

  if (profile.interests && profile.interests.length >= 2) {
    score += 15;
  } else {
    missingSteps.push('Select at least 2 domain interests');
  }

  if (profile.availability) {
    score += 10;
  }

  if (profile.linkedinUrl || profile.githubUrl) {
    score += 10;
  } else {
    missingSteps.push('Link your LinkedIn or GitHub');
  }

  if (profile.pastProjects && profile.pastProjects.length >= 1) {
    score += 10;
  } else {
    missingSteps.push('Add a past project / portfolio highlight');
  }

  let label = 'Starter';
  if (score >= 90) label = 'All-Star Saathi';
  else if (score >= 70) label = 'Strong Profile';
  else if (score >= 45) label = 'Intermediate';

  return {
    percentage: Math.min(100, score),
    label,
    missingSteps,
  };
}
