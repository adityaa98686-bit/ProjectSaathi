import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  Trash2, 
  Sparkles, 
  Layers, 
  Clock, 
  Tag, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { Project, ProjectDomain, ProjectType, ExperienceLevel, OpenRole, UserProfile } from '../types';

interface PostProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSaveProject: (project: Project) => void;
}

const POPULAR_SKILLS = [
  'TypeScript', 'React', 'Python', 'PyTorch', 'Node.js', 'FastAPI', 
  'Gemini API', 'Tailwind CSS', 'Figma', 'PostgreSQL', 'Go', 'Docker',
  'Rust', 'Design Systems', 'Product Strategy', 'Audio Processing'
];

export const PostProjectModal: React.FC<PostProjectModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProject,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState<ProjectDomain>('AI & Machine Learning');
  const [projectType, setProjectType] = useState<ProjectType>('Hackathon');
  const [difficulty, setDifficulty] = useState<ExperienceLevel>('Intermediate');
  const [commitmentHours, setCommitmentHours] = useState<number>(15);
  const [deadline, setDeadline] = useState('Hackathon Demo in 2 weeks');

  const [requiredSkills, setRequiredSkills] = useState<string[]>([
    'TypeScript', 'React', 'Gemini API'
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');

  const [roles, setRoles] = useState<OpenRole[]>([
    {
      id: `role-init-1`,
      title: 'Full-Stack Developer',
      category: 'Frontend',
      description: 'Lead client interface and integrate server-side intelligence.',
      requiredSkills: ['React', 'TypeScript', 'Tailwind CSS'],
      spots: 1,
      filled: 0,
    }
  ]);

  const handleAddSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills([...requiredSkills, trimmed]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillName: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skillName));
  };

  const handleAddRole = () => {
    setRoles([
      ...roles,
      {
        id: `role-${Date.now()}`,
        title: 'Product / UI Designer',
        category: 'UI / UX',
        description: 'Design key flows, interactive states, and component systems.',
        requiredSkills: ['Figma', 'Design Systems'],
        spots: 1,
        filled: 0,
      }
    ]);
  };

  const handleUpdateRole = (index: number, field: keyof OpenRole, value: any) => {
    const next = [...roles];
    next[index] = { ...next[index], [field]: value };
    setRoles(next);
  };

  const handleRemoveRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !tagline.trim()) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title,
      tagline,
      description: description || tagline,
      ownerId: currentUser.id,
      owner: currentUser,
      domain,
      projectType,
      difficulty,
      requiredSkills: requiredSkills.length > 0 ? requiredSkills : ['TypeScript', 'React'],
      desiredSkillCategories: ['Frontend', 'Backend', 'AI / ML', 'UI / UX', 'Product', 'DevOps'],
      openRoles: roles.length > 0 ? roles : [
        {
          id: `role-${Date.now()}`,
          title: 'Core Contributor',
          category: 'Frontend',
          description: 'Collaborate across core architecture and features.',
          requiredSkills: requiredSkills.slice(0, 3),
          spots: 1,
          filled: 0,
        }
      ],
      team: [],
      maxTeamSize: 4,
      commitmentHours,
      deadline,
      createdAt: 'Just now',
      isFeatured: true,
    };

    onSaveProject(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#08080A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-[#08080A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 flex items-center justify-center text-[#14b8a6]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Post a New Project
              </h2>
              <p className="text-xs text-white/40">
                Find compatible companions based on skills, domain interest, and availability.
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Title & Tagline */}
          <div className="space-y-4">
            <div>
              <label className="font-semibold text-white/70 block mb-1.5">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. MedEcho AI Diagnostic Companion"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#14b8a6]"
              />
            </div>

            <div>
              <label className="font-semibold text-white/70 block mb-1.5">
                One-Sentence Tagline *
              </label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Real-time acoustic biomarker analysis for respiratory health screening during telehealth."
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#14b8a6]"
              />
            </div>

            <div>
              <label className="font-semibold text-white/70 block mb-1.5">
                Detailed Scope & Vision
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the problem, current progress, target milestone, and why this project matters..."
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#14b8a6] leading-relaxed"
              />
            </div>
          </div>

          {/* Domain & Project Classification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5">
            <div>
              <label className="font-semibold text-white/70 block mb-1.5">
                Project Domain
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value as ProjectDomain)}
                className="w-full p-3 rounded-xl bg-[#08080A] border border-white/10 text-white/80 focus:outline-none focus:border-[#14b8a6] cursor-pointer"
              >
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Climate & CleanTech">Climate & CleanTech</option>
                <option value="Fintech & Payments">Fintech & Payments</option>
                <option value="Healthcare & Biotech">Healthcare & Biotech</option>
                <option value="Web3 & Decentralized">Web3 & Decentralized</option>
                <option value="Developer Tools">Developer Tools</option>
                <option value="Education & EdTech">Education & EdTech</option>
                <option value="Robotics & IoT">Robotics & IoT</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-white/70 block mb-1.5">
                Type of Project
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className="w-full p-3 rounded-xl bg-[#08080A] border border-white/10 text-white/80 focus:outline-none focus:border-[#14b8a6] cursor-pointer"
              >
                <option value="Hackathon">Hackathon</option>
                <option value="Startup">Startup / Venture</option>
                <option value="Research">Academic / Research</option>
                <option value="Competition">Competition</option>
                <option value="Open Source">Open Source</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-white/70 block mb-1.5">
                Target Experience
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as ExperienceLevel)}
                className="w-full p-3 rounded-xl bg-[#08080A] border border-white/10 text-white/80 focus:outline-none focus:border-[#14b8a6] cursor-pointer"
              >
                <option value="Beginner">Beginner Friendly</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced / Production</option>
                <option value="Lead">Lead / Expert</option>
              </select>
            </div>
          </div>

          {/* Timeline & Weekly Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-white/70 block mb-1.5">
                Target Timeline / Milestone
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. Hackathon Demo in 14 days"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#14b8a6]"
              />
            </div>

            <div>
              <label className="font-semibold text-white/70 block mb-1.5">
                Expected Weekly Commitment: <span className="text-[#14b8a6] font-bold">{commitmentHours} hrs/week</span>
              </label>
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={commitmentHours}
                onChange={(e) => setCommitmentHours(Number(e.target.value))}
                className="w-full accent-[#14b8a6] cursor-pointer mt-2"
              />
            </div>
          </div>

          {/* Required Skills Picker */}
          <div className="pt-2 border-t border-white/5">
            <label className="font-semibold text-white/70 block mb-1.5">
              Required Tech Stack & Skills ({requiredSkills.length})
            </label>
            
            {/* Active Selected Skills */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {requiredSkills.map((sk) => (
                <span
                  key={sk}
                  className="px-3 py-1 rounded-full bg-[#14b8a6]/10 text-[#14b8a6] border border-[#14b8a6]/20 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>{sk}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(sk)}
                    className="hover:text-rose-300 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Custom Input */}
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(newSkillInput);
                  }
                }}
                placeholder="Type a skill and press Enter..."
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs flex-1 focus:outline-none focus:border-[#14b8a6]"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(newSkillInput)}
                className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold cursor-pointer"
              >
                Add Skill
              </button>
            </div>

            {/* Popular Suggestions */}
            <div className="flex flex-wrap gap-1 text-[11px] text-white/40">
              <span className="self-center mr-1 text-white/30">Popular:</span>
              {POPULAR_SKILLS.filter(s => !requiredSkills.includes(s)).slice(0, 7).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAddSkill(s)}
                  className="px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 cursor-pointer"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Open Roles Management */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-semibold text-white/70 block">
                  Open Roles to Recruit ({roles.length})
                </label>
                <span className="text-white/40 text-[11px]">
                  Define the specific seats you want companions to fill.
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddRole}
                className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#14b8a6] font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Another Role</span>
              </button>
            </div>

            <div className="space-y-3">
              {roles.map((role, idx) => (
                <div
                  key={role.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 relative"
                >
                  {roles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(idx)}
                      className="absolute top-3.5 right-3.5 text-white/30 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Role Title (e.g. Lead Frontend Engineer)"
                      value={role.title}
                      onChange={(e) => handleUpdateRole(idx, 'title', e.target.value)}
                      className="p-2.5 rounded-xl bg-[#08080A] border border-white/10 text-white text-xs focus:outline-none focus:border-[#14b8a6]"
                    />

                    <select
                      value={role.category}
                      onChange={(e) => handleUpdateRole(idx, 'category', e.target.value)}
                      className="p-2.5 rounded-xl bg-[#08080A] border border-white/10 text-white text-xs focus:outline-none focus:border-[#14b8a6] cursor-pointer"
                    >
                      <option value="Frontend">Frontend / Full-Stack</option>
                      <option value="Backend">Backend / Systems</option>
                      <option value="AI / ML">AI / Machine Learning</option>
                      <option value="UI / UX">UI / UX Product Design</option>
                      <option value="Product">Product & Growth</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    placeholder="Short mission description for this role..."
                    value={role.description}
                    onChange={(e) => handleUpdateRole(idx, 'description', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#08080A] border border-white/10 text-white text-xs focus:outline-none focus:border-[#14b8a6]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
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
              <span>Publish Project & Start Matching</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
