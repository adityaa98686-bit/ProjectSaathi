export type AvailabilityStatus = 'available' | 'open_to_explore' | 'occupied';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Lead';

export type ProjectType = 'Hackathon' | 'Startup' | 'Research' | 'Competition' | 'Open Source';

export type ProjectDomain = 
  | 'AI & Machine Learning' 
  | 'Fintech & Payments' 
  | 'Climate & CleanTech' 
  | 'Healthcare & Biotech' 
  | 'Web3 & Decentralized' 
  | 'Developer Tools' 
  | 'Education & EdTech'
  | 'Robotics & IoT';

export interface Skill {
  name: string;
  category: 'technical' | 'design' | 'domain' | 'soft';
  level?: 'familiar' | 'proficient' | 'expert';
}

export interface PastProject {
  id: string;
  title: string;
  role: string;
  description: string;
  link?: string;
  technologies: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  headline: string;
  bio: string;
  email: string;
  location: string;
  availability: AvailabilityStatus;
  hoursPerWeek: number;
  experienceLevel: ExperienceLevel;
  primaryRole: string;
  linkedinUrl?: string;
  isLinkedinVerified: boolean;
  githubUrl?: string;
  portfolioUrl?: string;
  skills: Skill[];
  interests: string[];
  pastProjects: PastProject[];
  joinedDate: string;
}

export interface OpenRole {
  id: string;
  title: string;
  category: string; // e.g. "Frontend", "Backend", "AI/ML", "UI/UX", "Product"
  description: string;
  requiredSkills: string[];
  spots: number;
  filled: number;
}

export interface TeamMember {
  userId: string;
  user: UserProfile;
  roleTitle: string;
  joinedAt: string;
}

export type RecruitmentStatus = 'active' | 'paused' | 'closed';

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  ownerId: string;
  owner: UserProfile;
  domain: ProjectDomain;
  projectType: ProjectType;
  difficulty: ExperienceLevel;
  requiredSkills: string[];
  desiredSkillCategories: string[]; // for radar chart (e.g., ['Frontend', 'Backend', 'AI/ML', 'UI/UX', 'Product', 'DevOps'])
  openRoles: OpenRole[];
  team: TeamMember[];
  maxTeamSize: number;
  commitmentHours: number;
  deadline?: string;
  createdAt: string;
  githubRepo?: string;
  pitchDeckUrl?: string;
  isFeatured?: boolean;
  recruitmentStatus?: RecruitmentStatus;
}

export type ApplicationStatus = 'pending' | 'viewed' | 'accepted' | 'waitlisted' | 'declined';

export interface Application {
  id: string;
  projectId: string;
  projectTitle: string;
  projectDomain: ProjectDomain;
  applicantId: string;
  applicant: UserProfile;
  roleId: string;
  roleTitle: string;
  note: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  matchScore: number;
  matchBreakdown: MatchBreakdown;
}

export interface MatchBreakdown {
  overallScore: number;
  skillOverlapScore: number; // 40%
  roleFitScore: number;       // 20%
  availabilityScore: number;  // 15%
  experienceFitScore: number; // 15%
  interestOverlapScore: number; // 10%
  matchedSkills: string[];
  missingSkills: string[];
  explanation: string;
  quickHighlight: string;
}

export interface RadarDataPoint {
  dimension: string;
  required: number; // 0 - 100
  covered: number;  // 0 - 100
}

export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'saved_for_later';

export interface InvitationMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isOwner?: boolean;
}

export interface ProjectInvitation {
  id: string;
  projectId: string;
  projectTitle: string;
  projectTagline?: string;
  projectLogo?: string;
  projectDomain: ProjectDomain;
  candidateId: string;
  candidate: UserProfile;
  ownerId: string;
  owner: UserProfile;
  roleTitle: string;
  roleId?: string;
  initialNote: string;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
  matchScore: number;
  matchBreakdown: MatchBreakdown;
  messages: InvitationMessage[];
}
