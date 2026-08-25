import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  ArrowRight,
  Linkedin,
  Github,
  Globe
} from 'lucide-react';
import { UserProfile, Skill, ExperienceLevel, AvailabilityStatus } from '../types';
import { StatusDot } from './StatusDot';
import { CompletenessBar } from './CompletenessBar';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  isInitialOnboarding?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
  isInitialOnboarding = false,
}) => {
  if (!isOpen) return null;

  // Editable Form State
  const [name, setName] = useState(currentUser.name);
  const [headline, setHeadline] = useState(currentUser.headline);
  const [bio, setBio] = useState(currentUser.bio);
  const [location, setLocation] = useState(currentUser.location);
  const [primaryRole, setPrimaryRole] = useState(currentUser.primaryRole);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(currentUser.experienceLevel);
  const [availability, setAvailability] = useState<AvailabilityStatus>(currentUser.availability);
  const [hoursPerWeek, setHoursPerWeek] = useState(currentUser.hoursPerWeek);
  const [linkedinUrl, setLinkedinUrl] = useState(currentUser.linkedinUrl || '');
  const [githubUrl, setGithubUrl] = useState(currentUser.githubUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(currentUser.portfolioUrl || '');
  
  const [skills, setSkills] = useState<Skill[]>(currentUser.skills);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<'technical' | 'design' | 'domain' | 'soft'>('technical');

  const [interests, setInterests] = useState<string[]>(currentUser.interests);
  const [newInterestInput, setNewInterestInput] = useState('');

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    if (skills.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) return;

    setSkills([
      ...skills,
      {
        name: newSkillName.trim(),
        category: newSkillCategory,
        level: 'proficient'
      }
    ]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (nameToRemove: string) => {
    setSkills(skills.filter(s => s.name !== nameToRemove));
  };

  const handleAddInterest = (interest: string) => {
    const clean = interest.trim();
    if (clean && !interests.includes(clean)) {
      setInterests([...interests, clean]);
    }
    setNewInterestInput('');
  };

  const handleRemoveInterest = (toRemove: string) => {
    setInterests(interests.filter(i => i !== toRemove));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const isVerified = Boolean(linkedinUrl && linkedinUrl.includes('linkedin.com'));

    const updatedUser: UserProfile = {
      ...currentUser,
      name,
      headline,
      bio,
      location,
      primaryRole,
      experienceLevel,
      availability,
      hoursPerWeek,
      linkedinUrl,
      isLinkedinVerified: isVerified,
      githubUrl,
      portfolioUrl,
      skills,
      interests,
    };

    onSaveProfile(updatedUser);
    onClose();
  };

  // Preview user for completeness bar
  const tempUser: UserProfile = {
    ...currentUser,
    name,
    headline,
    bio,
    skills,
    interests,
    availability,
    linkedinUrl,
    githubUrl,
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#08080A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-6 border-b border-white/5 bg-[#08080A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 flex items-center justify-center text-[#14b8a6]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                {isInitialOnboarding ? 'Welcome to ProjectSaathi' : 'Edit Profile & Skills'}
              </h2>
              <p className="text-xs text-white/40">
                Powers your 5-factor compatibility match scores across all projects.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Completeness Bar */}
          <CompletenessBar user={tempUser} />

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-white/70 block mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#14b8a6]"
              />
            </div>

            <div>
              <label className="font-semibold text-white/70 block mb-1.5">
                Primary Role Title *
              </label>
              <input
                type="text"
                required
                value={primaryRole}
                onChange={(e) => setPrimaryRole(e.target.value)}
                placeholder="e.g. Full-Stack Engineer, UI/UX Lead"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#14b8a6]"
              />
            </div>
          </div>

          {/* Headline & Bio */}
          <div className="space-y-4">
            <div>
              <label className="font-semibold text-white/70 block mb-1.5">
                Professional Headline *
              </label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Product Designer building accessible AI tools"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#14b8a6]"
              />
            </div>

            <div>
              <label className="font-semibold text-white/70 block mb-1.5">
                Bio & Motivation
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="What drives you? What kind of project companions are you looking for?"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#14b8a6] leading-relaxed"
              />
            </div>
          </div>

          {/* Availability Status & Hours */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
            <div className="font-display font-bold text-[10px] uppercase tracking-[0.2em] text-white/40">
              Availability Status (Required & Public)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'available', title: 'Available', desc: 'Ready to build now', status: 'available' },
                { id: 'open_to_explore', title: 'Open to Explore', desc: 'Selective matching', status: 'open_to_explore' },
                { id: 'occupied', title: 'Occupied', desc: 'Limited bandwidth', status: 'occupied' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAvailability(opt.id as AvailabilityStatus)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    availability === opt.id
                      ? 'bg-white/10 border-[#14b8a6] shadow-md glow-accent'
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <StatusDot status={opt.status as any} size="md" />
                    <span className="font-semibold text-white">{opt.title}</span>
                  </div>
                  <span className="text-[11px] text-white/40">{opt.desc}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="font-semibold text-white/70 block mb-1">
                  Weekly Available Hours: <span className="text-[#14b8a6] font-bold">{hoursPerWeek} hrs/week</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="5"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="w-full accent-[#14b8a6] cursor-pointer"
                />
              </div>

              <div>
                <label className="font-semibold text-white/70 block mb-1">
                  Experience Tier
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                  className="w-full p-2.5 rounded-xl bg-[#08080A] border border-white/10 text-white/80 focus:outline-none focus:border-[#14b8a6] cursor-pointer"
                >
                  <option value="Beginner">Beginner / Exploring</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced / Senior</option>
                  <option value="Lead">Lead / Architect</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tagged Skills Manager */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-white/70 block">
                Tagged Skills ({skills.length})
              </label>
              <span className="text-white/40 text-[11px]">Directly impacts Match Score %</span>
            </div>

            {/* Existing Skills */}
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s.name}
                  className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
                    s.category === 'technical'
                      ? 'bg-[#6366f1]/15 text-indigo-300 border-[#6366f1]/30'
                      : s.category === 'design'
                      ? 'bg-fuchsia-950/60 text-fuchsia-200 border-fuchsia-800/60'
                      : s.category === 'domain'
                      ? 'bg-[#14b8a6]/15 text-[#14b8a6] border-[#14b8a6]/30'
                      : 'bg-white/5 text-white/60 border-white/5'
                  }`}
                >
                  <span>{s.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s.name)}
                    className="hover:text-rose-400 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Add Skill Row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. Next.js, Figma, PyTorch)..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white flex-1 focus:outline-none focus:border-[#14b8a6]"
              />

              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value as any)}
                className="p-2.5 rounded-xl bg-[#08080A] border border-white/10 text-white/80 focus:outline-none cursor-pointer"
              >
                <option value="technical">Technical</option>
                <option value="design">Design / UX</option>
                <option value="domain">Domain / Specialty</option>
                <option value="soft">Soft Skill</option>
              </select>

              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/10 cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Domain Interests */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="font-semibold text-white/70 block">
              Domain Interests ({interests.length})
            </label>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 rounded-full bg-[#14b8a6]/10 text-[#14b8a6] border border-[#14b8a6]/20 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(interest)}
                    className="hover:text-rose-400 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-1 text-[11px] text-white/40">
              <span className="self-center mr-1 text-white/30">Pick:</span>
              {[
                'AI & Machine Learning',
                'Fintech & Payments',
                'Climate & CleanTech',
                'Healthcare & Biotech',
                'Web3 & Decentralized',
                'Developer Tools'
              ].filter(d => !interests.includes(d)).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleAddInterest(d)}
                  className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 cursor-pointer"
                >
                  + {d}
                </button>
              ))}
            </div>
          </div>

          {/* Verification & Social Links */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white/70">
                Verification & External Profiles
              </span>
              <span className="text-[11px] text-sky-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> LinkedIn adds Verified Badge
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Linkedin className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#14b8a6]"
                />
              </div>

              <div className="relative">
                <Github className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#14b8a6]"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 font-semibold border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white font-bold text-xs shadow-lg glow-accent transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>Save & Update Matching Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
