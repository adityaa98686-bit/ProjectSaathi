import React, { useState } from 'react';
import { 
  UserPlus, 
  LogIn, 
  Sparkles, 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Briefcase, 
  Play,
  Linkedin,
  Github,
  Award,
  Globe,
  MapPin
} from 'lucide-react';
import { UserProfile, ExperienceLevel, AvailabilityStatus, Skill, PastProject } from '../types';
import { SEED_CANDIDATES } from '../data/mockData';
import { ThemeToggle } from './ThemeToggle';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (newUser: UserProfile) => void;
  onLogin: (email: string) => void;
  onSelectDemo: (demoUser: UserProfile) => void;
  initialTab?: 'register' | 'login' | 'demo';
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
];

const SUGGESTED_SKILLS = [
  'TypeScript', 'React', 'Node.js', 'Python', 'PyTorch', 
  'Gemini API', 'Figma', 'Tailwind CSS', 'PostgreSQL', 
  'FastAPI', 'UI/UX Design', 'Product Strategy', 'Docker'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onRegister,
  onLogin,
  onSelectDemo,
  initialTab = 'register',
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'demo'>(initialTab);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPrimaryRole, setRegPrimaryRole] = useState('Full-Stack Engineer');
  const [regHeadline, setRegHeadline] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regLocation, setRegLocation] = useState('Bengaluru / Remote');
  const [regHours, setRegHours] = useState(20);
  const [regExp, setRegExp] = useState<ExperienceLevel>('Intermediate');
  const [regAvailability, setRegAvailability] = useState<AvailabilityStatus>('available');
  const [regAvatar, setRegAvatar] = useState(DEFAULT_AVATARS[0]);
  const [regSkills, setRegSkills] = useState<string[]>(['TypeScript', 'React', 'Node.js', 'PostgreSQL']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [regLinkedin, setRegLinkedin] = useState('');
  const [regGithub, setRegGithub] = useState('');
  const [regPortfolio, setRegPortfolio] = useState('');
  const [regPastProjects, setRegPastProjects] = useState<PastProject[]>([]);
  const [regInterests, setRegInterests] = useState<string[]>(['AI & Machine Learning', 'Developer Tools']);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Selected Demo Persona
  const [selectedDemoUser, setSelectedDemoUser] = useState<UserProfile>(SEED_CANDIDATES[0]);

  if (!isOpen) return null;

  const handleAddSkill = (skill: string) => {
    if (!skill.trim()) return;
    if (!regSkills.includes(skill.trim())) {
      setRegSkills([...regSkills, skill.trim()]);
    }
    setCustomSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setRegSkills(regSkills.filter((s) => s !== skillToRemove));
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) return;

    const skillsToSave = regSkills.length > 0 ? regSkills : ['TypeScript', 'React', 'Gemini API'];

    const formattedSkills: Skill[] = skillsToSave.map((sk) => {
      let cat: 'technical' | 'design' | 'domain' | 'soft' = 'technical';
      if (['Figma', 'UI/UX Design', 'Design Systems', 'Tailwind CSS'].includes(sk)) cat = 'design';
      else if (['Product Strategy', 'AI & Machine Learning', 'Fintech & Payments', 'Biotech'].includes(sk)) cat = 'domain';
      return {
        name: sk,
        category: cat,
        level: 'proficient',
      };
    });

    const newUser: UserProfile = {
      id: `user-reg-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim(),
      avatar: regAvatar,
      headline: regHeadline.trim() || `${regPrimaryRole} enthusiastic about collaborative building`,
      bio: regBio.trim() || `Passionate ${regPrimaryRole} looking for high-impact project companions.`,
      location: regLocation,
      availability: regAvailability,
      hoursPerWeek: regHours,
      experienceLevel: regExp,
      primaryRole: regPrimaryRole,
      isLinkedinVerified: Boolean(regLinkedin && regLinkedin.includes('linkedin.com')),
      linkedinUrl: regLinkedin || undefined,
      githubUrl: regGithub || undefined,
      portfolioUrl: regPortfolio || undefined,
      skills: formattedSkills,
      interests: regInterests.length > 0 ? regInterests : ['AI & Machine Learning', 'Developer Tools'],
      pastProjects: regPastProjects,
      joinedDate: 'Joined Today',
    };

    onRegister(newUser);
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setLoginError('Please enter your email address');
      return;
    }
    onLogin(loginEmail.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#08080A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="p-6 border-b border-white/5 bg-[#08080A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6366f1]/30 to-[#14b8a6]/30 border border-[#14b8a6]/30 flex items-center justify-center text-[#14b8a6] shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white tracking-tight">
                Welcome to ProjectSaathi
              </h2>
              <p className="text-xs text-white/40">
                Choose how you'd like to join or explore the companion matching platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle variant="icon" />
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Main Choice Tabs */}
        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
          <div className="grid grid-cols-3 gap-2 bg-[#14141E] p-1.5 rounded-2xl border border-white/5">
            <button
              onClick={() => setActiveTab('register')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-[#6366f1] to-[#14b8a6] text-white shadow-lg'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Register</span>
            </button>

            <button
              onClick={() => setActiveTab('login')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-[#6366f1] to-[#14b8a6] text-white shadow-lg'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Already Log In</span>
            </button>

            <button
              onClick={() => setActiveTab('demo')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'demo'
                  ? 'bg-gradient-to-r from-[#6366f1] to-[#14b8a6] text-white shadow-lg'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-[#14b8a6]" />
              <span>Demo Version</span>
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: NEW REGISTRATION */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              
              {/* Profile Details Header */}
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <div>
                  <h4 className="text-sm font-bold text-white">Create Candidate Profile</h4>
                  <p className="text-xs text-white/50">Enter your details to generate match scores with all active hackathons & builders</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#14b8a6]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-semibold">Instant Compatibility</span>
                </div>
              </div>

              {/* SECTION: EDITABLE PROFILE FIELDS */}
              <div className="space-y-4 pt-1">
                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Rivera"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/20 focus:outline-none focus:border-[#14b8a6]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. alex.rivera@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/20 focus:outline-none focus:border-[#14b8a6]"
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Primary Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1.5">
                      Account Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="Create your password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/20 focus:outline-none focus:border-[#14b8a6]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1.5">
                      Primary Role Title *
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. AI / ML Engineer, Full-Stack Engineer"
                        value={regPrimaryRole}
                        onChange={(e) => setRegPrimaryRole(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/20 focus:outline-none focus:border-[#14b8a6]"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Headline */}
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1.5">
                    Professional Headline *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Machine Learning Engineer building agentic systems"
                    value={regHeadline}
                    onChange={(e) => setRegHeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/20 focus:outline-none focus:border-[#14b8a6]"
                  />
                </div>

                {/* Bio / Summary */}
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1.5">
                    Bio & Project Motivation
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief background about your experience and what projects you want to build..."
                    value={regBio}
                    onChange={(e) => setRegBio(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/20 focus:outline-none focus:border-[#14b8a6] leading-relaxed"
                  />
                </div>

                {/* Location, Availability & Experience Tier */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div>
                    <label className="text-[11px] font-semibold text-white/60 block mb-1">
                      Location / Region
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-white/30 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={regLocation}
                        onChange={(e) => setRegLocation(e.target.value)}
                        placeholder="e.g. San Francisco / Remote"
                        className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-[#08080A] border border-white/10 text-white text-xs focus:outline-none focus:border-[#14b8a6]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-white/60 block mb-1">
                      Hours / Week: <strong className="text-[#14b8a6]">{regHours}h</strong>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="5"
                      value={regHours}
                      onChange={(e) => setRegHours(Number(e.target.value))}
                      className="w-full accent-[#14b8a6] cursor-pointer mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-white/60 block mb-1">
                      Experience Level
                    </label>
                    <select
                      value={regExp}
                      onChange={(e) => setRegExp(e.target.value as ExperienceLevel)}
                      className="w-full p-1.5 rounded-lg bg-[#08080A] border border-white/10 text-white text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Lead">Lead / Staff</option>
                    </select>
                  </div>
                </div>

                {/* Social Links Extracted / Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative">
                    <Linkedin className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="LinkedIn URL (e.g. linkedin.com/in/username)"
                      value={regLinkedin}
                      onChange={(e) => setRegLinkedin(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/20 focus:outline-none focus:border-[#14b8a6]"
                    />
                  </div>

                  <div className="relative">
                    <Github className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="GitHub URL (e.g. github.com/username)"
                      value={regGithub}
                      onChange={(e) => setRegGithub(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/20 focus:outline-none focus:border-[#14b8a6]"
                    />
                  </div>
                </div>

                {/* Extracted / Tagged Skills */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white/70">
                      Extracted & Tagged Skills ({regSkills.length})
                    </label>
                    <span className="text-[10px] text-white/40">Directly impacts 5-factor compatibility match scores</span>
                  </div>

                  {regSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-white/[0.02] border border-white/5">
                      {regSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2.5 py-1 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 text-[#14b8a6] text-xs font-medium flex items-center gap-1.5"
                        >
                          <span>{sk}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(sk)}
                            className="hover:text-white transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/30 italic">
                      No skills selected yet. Select or type skills below.
                    </p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add custom skill (e.g. FastAPI, Docker, PyTorch)..."
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill(customSkillInput);
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#14b8a6]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSkill(customSkillInput)}
                      className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold cursor-pointer"
                    >
                      Add Skill
                    </button>
                  </div>

                  {/* Suggestions */}
                  <div className="flex flex-wrap gap-1 text-[10px] text-white/40 pt-1">
                    <span className="self-center mr-1">Quick Add:</span>
                    {SUGGESTED_SKILLS.filter((s) => !regSkills.includes(s)).slice(0, 6).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleAddSkill(s)}
                        className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 cursor-pointer"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Choose Profile Avatar */}
                <div className="pt-2">
                  <label className="text-xs font-semibold text-white/70 block mb-2">
                    Choose Profile Avatar
                  </label>
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {DEFAULT_AVATARS.map((avatarUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setRegAvatar(avatarUrl)}
                        className={`relative rounded-full p-0.5 transition-all cursor-pointer shrink-0 ${
                          regAvatar === avatarUrl
                            ? 'ring-2 ring-[#14b8a6] scale-110 shadow-lg'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={avatarUrl} alt={`Avatar ${idx}`} className="w-10 h-10 rounded-full object-cover" />
                        {regAvatar === avatarUrl && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#14b8a6] flex items-center justify-center text-black text-[9px] font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Submit Registration */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  Already registered? <span className="text-[#14b8a6] font-semibold">Log In</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white font-bold text-xs shadow-lg glow-accent transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Create Account & Start Matching</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: ALREADY REGISTERED / LOG IN */}
          {activeTab === 'login' && (
            <div className="space-y-6">
              
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1.5">
                    Account Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. aarav.mehta@example.com"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        setLoginError('');
                      }}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/20 focus:outline-none focus:border-[#14b8a6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/20 focus:outline-none focus:border-[#14b8a6]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    Need an account? <span className="text-[#14b8a6] font-semibold">Register New</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white font-bold text-xs shadow-lg glow-accent transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Log In to Account</span>
                  </button>
                </div>
              </form>

              {/* Quick 1-Click Login Shortcuts for convenience */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Or 1-Click Login as an existing member:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SEED_CANDIDATES.slice(0, 4).map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        onLogin(user.email);
                        onClose();
                      }}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#14b8a6]/40 flex items-center gap-3 text-left transition-all cursor-pointer group"
                    >
                      <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white group-hover:text-[#14b8a6] transition-colors truncate">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-white/40 truncate">
                          {user.primaryRole}
                        </div>
                      </div>
                      <span className="text-[10px] text-[#14b8a6] opacity-0 group-hover:opacity-100 transition-opacity">
                        Sign In →
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: DEMO PERSONA SELECTOR */}
          {activeTab === 'demo' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#6366f1]/10 to-[#14b8a6]/10 border border-white/10 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#14b8a6]/20 border border-[#14b8a6]/40 flex items-center justify-center text-[#14b8a6] shrink-0 mt-0.5">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">
                    Instant Demo Mode
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
                    Choose any pre-configured persona below to test live 5-factor matching calculations, skill gap radar, and project creation without registering.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Select a Demo Persona:
                </div>

                <div className="grid grid-cols-1 gap-2.5 max-h-72 overflow-y-auto">
                  {SEED_CANDIDATES.map((user) => {
                    const isSelected = selectedDemoUser.id === user.id;
                    return (
                      <div
                        key={user.id}
                        onClick={() => setSelectedDemoUser(user)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#14b8a6]/10 border-[#14b8a6] shadow-md'
                            : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative">
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                            {user.isLinkedinVerified && (
                              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-sky-500 rounded-full flex items-center justify-center text-[8px] text-white">
                                ✓
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-white/60 font-normal">
                                {user.experienceLevel}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#14b8a6] truncate">
                              {user.primaryRole} • {user.hoursPerWeek}h/wk
                            </div>
                            <div className="text-[10px] text-white/40 truncate mt-0.5">
                              {user.skills.slice(0, 4).map((s) => s.name).join(', ')}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectDemo(user);
                              onClose();
                            }}
                            className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-[#14b8a6] text-white hover:text-black text-xs font-bold transition-all cursor-pointer"
                          >
                            Use Demo
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-white/40">
                  Ready to test with <strong className="text-white">{selectedDemoUser.name}</strong>?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSelectDemo(selectedDemoUser);
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white font-bold text-xs shadow-lg glow-accent transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch Demo as {selectedDemoUser.name}</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
