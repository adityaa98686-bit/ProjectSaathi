import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Github, 
  Linkedin, 
  Globe, 
  Mail, 
  Briefcase, 
  Sparkles, 
  ShieldCheck,
  UserPlus,
  Send
} from 'lucide-react';
import { UserProfile, Project } from '../types';
import { StatusDot } from './StatusDot';
import { SkillGapRadar } from './SkillGapRadar';
import { computeUserSkillRadar } from '../utils/matchingEngine';

interface CandidateProfileModalProps {
  candidate: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  myProjects?: Project[];
  onInviteToProject?: (candidateId: string, projectId: string, roleTitle?: string, note?: string) => void;
}

export const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  candidate,
  isOpen,
  onClose,
  myProjects = [],
  onInviteToProject,
}) => {
  if (!isOpen || !candidate) return null;

  const [selectedInviteProject, setSelectedInviteProject] = useState<string>(
    myProjects[0]?.id || ''
  );
  const [inviteNote, setInviteNote] = useState<string>('');
  const [inviteSent, setInviteSent] = useState<boolean>(false);

  const radarData = computeUserSkillRadar(candidate);

  const technicalSkills = candidate.skills.filter((s) => s.category === 'technical');
  const designSkills = candidate.skills.filter((s) => s.category === 'design');
  const domainSkills = candidate.skills.filter((s) => s.category === 'domain');
  const softSkills = candidate.skills.filter((s) => s.category === 'soft');

  const selectedProjObj = (myProjects || []).find((p) => p.id === selectedInviteProject) || myProjects?.[0];

  const handleSendInvite = () => {
    if (!selectedInviteProject || !onInviteToProject) return;
    const defaultRole = selectedProjObj?.openRoles?.[0]?.title || candidate.primaryRole;
    onInviteToProject(candidate.id, selectedInviteProject, defaultRole, inviteNote || undefined);
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setInviteNote('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#08080A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Cover Banner */}
        <div className="h-28 bg-gradient-to-r from-[#6366f1]/30 via-white/5 to-[#14b8a6]/20 p-4 flex justify-end relative border-b border-white/5">
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/40 hover:text-white transition-colors cursor-pointer self-start"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Avatar & Primary Info */}
        <div className="px-6 pb-6 pt-0 relative flex-1 overflow-y-auto">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 mb-6">
            <div className="relative">
              <img
                src={candidate.avatar}
                alt={candidate.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-[#08080A] shadow-xl"
              />
              <StatusDot
                status={candidate.availability}
                size="lg"
                className="absolute bottom-1 right-1"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <StatusDot status={candidate.availability} showLabel />
              <span className="px-3 py-1 rounded-full bg-[#14b8a6]/10 text-[#14b8a6] border border-[#14b8a6]/20 text-xs font-bold">
                {candidate.experienceLevel} Tier
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-white/60 border border-white/10 text-xs font-medium">
                {candidate.hoursPerWeek}h / week
              </span>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Title & Bio */}
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-display text-2xl font-bold text-white">
                  {candidate.name}
                </h2>
                {candidate.isLinkedinVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-sky-950/80 text-sky-300 border border-sky-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> LinkedIn Verified
                  </span>
                )}
              </div>

              <div className="text-sm text-[#14b8a6] font-medium mt-0.5">
                {candidate.headline}
              </div>

              <div className="flex items-center gap-4 text-xs text-white/40 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-white/30" /> {candidate.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-white/30" /> {candidate.joinedDate}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-white/70 mt-4 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                {candidate.bio}
              </p>
            </div>

            {/* Verification Links */}
            <div className="flex flex-wrap gap-3 text-xs">
              {candidate.linkedinUrl && (
                <a
                  href={candidate.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-sky-300 hover:border-sky-500 transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="w-3 h-3 text-white/30" />
                </a>
              )}
              {candidate.githubUrl && (
                <a
                  href={candidate.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:border-white/20 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 text-white/30" />
                </a>
              )}
              {candidate.portfolioUrl && (
                <a
                  href={candidate.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#14b8a6] hover:border-[#14b8a6] transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Portfolio</span>
                  <ExternalLink className="w-3 h-3 text-white/30" />
                </a>
              )}
            </div>

            {/* Skill Radar & Skills Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-6 bg-white/5 p-5 rounded-2xl border border-white/5 text-center flex flex-col items-center">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
                  Candidate Competency Spider Radar
                </div>
                <SkillGapRadar data={radarData} size={230} showLegend={false} />
              </div>

              {/* Categorized Skills */}
              <div className="md:col-span-6 space-y-3">
                {technicalSkills.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-1.5">
                      Technical Skills
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {technicalSkills.map((s) => (
                        <span
                          key={s.name}
                          className="text-xs px-3 py-1 rounded-full bg-[#6366f1]/15 text-indigo-300 border border-[#6366f1]/30 font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {designSkills.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-400 mb-1.5">
                      Design & UX
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {designSkills.map((s) => (
                        <span
                          key={s.name}
                          className="text-xs px-3 py-1 rounded-full bg-fuchsia-950/60 text-fuchsia-200 border border-fuchsia-800/60 font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {domainSkills.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#14b8a6] mb-1.5">
                      Domain & Specialization
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {domainSkills.map((s) => (
                        <span
                          key={s.name}
                          className="text-xs px-3 py-1 rounded-full bg-[#14b8a6]/15 text-[#14b8a6] border border-[#14b8a6]/30 font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {softSkills.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1.5">
                      Soft & Collaboration
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {softSkills.map((s) => (
                        <span
                          key={s.name}
                          className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/60 border border-white/5 font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Past Projects */}
            {candidate.pastProjects && candidate.pastProjects.length > 0 && (
              <div>
                <h3 className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">
                  Past Project Highlights ({candidate.pastProjects.length})
                </h3>
                <div className="space-y-3">
                  {candidate.pastProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-sm text-white">
                          {proj.title}
                        </span>
                        <span className="text-xs text-[#14b8a6] font-medium">
                          {proj.role}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">
                        {proj.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/5"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invite to project action for owners */}
            {myProjects.length > 0 && onInviteToProject && (
              <div className="p-5 rounded-2xl bg-white/5 border border-[#14b8a6]/40 space-y-3 glow-accent">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-[#14b8a6]" /> Invite {candidate.name.split(' ')[0]} to your team
                    </span>
                    <span className="text-[11px] text-white/40">
                      Direct invite sends a proposal with option to accept, reject, save for later, or chat doubts.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={selectedInviteProject}
                      onChange={(e) => setSelectedInviteProject(e.target.value)}
                      className="bg-[#08080A] border border-white/10 rounded-full px-3 py-1.5 text-xs text-white/80 focus:outline-none focus:border-[#14b8a6]"
                    >
                      {myProjects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleSendInvite}
                      disabled={inviteSent}
                      className="px-5 py-2 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                    >
                      {inviteSent ? 'Invite Sent! ✓' : 'Send Invite'}
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={inviteNote}
                  onChange={(e) => setInviteNote(e.target.value)}
                  placeholder={`Add a personalized note or specific role pitch for ${candidate.name.split(' ')[0]}...`}
                  className="w-full bg-[#08080A] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#14b8a6] transition-colors"
                />
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-[#08080A] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
