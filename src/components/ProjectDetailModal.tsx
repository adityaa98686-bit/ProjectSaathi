import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  Users, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Briefcase, 
  ExternalLink,
  ShieldCheck,
  Send,
  Crown,
  PauseCircle,
  Lock,
  Hourglass
} from 'lucide-react';
import { Project, UserProfile, Application } from '../types';
import { MatchGauge } from './MatchGauge';
import { StatusDot } from './StatusDot';
import { SkillGapRadar } from './SkillGapRadar';
import { MatchScoreInfoButton } from './MatchScoreInfoButton';
import { computeMatchScore, computeTeamSkillGapRadar } from '../utils/matchingEngine';

interface ProjectDetailModalProps {
  project: Project | null;
  currentUser: UserProfile;
  existingApplication?: Application;
  isOpen: boolean;
  onClose: () => void;
  onSubmitApplication: (projectId: string, roleId: string, roleTitle: string, note: string) => void;
  onViewCandidate: (user: UserProfile) => void;
  onSwitchToOwnerMode?: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  currentUser,
  existingApplication,
  isOpen,
  onClose,
  onSubmitApplication,
  onViewCandidate,
  onSwitchToOwnerMode,
}) => {
  if (!isOpen || !project) return null;

  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    project.openRoles?.[0]?.id || ''
  );
  const [applicationNote, setApplicationNote] = useState<string>('');
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [showApplyForm, setShowApplyForm] = useState<boolean>(false);

  const isOwner = project.ownerId === currentUser.id || project.owner?.email?.toLowerCase() === currentUser.email?.toLowerCase();
  const recruitmentStatus = project.recruitmentStatus || 'active';
  const isPaused = recruitmentStatus === 'paused';
  const isClosed = recruitmentStatus === 'closed';

  const selectedRole = (project.openRoles || []).find((r) => r.id === selectedRoleId) || project.openRoles?.[0];

  // Compute live match score breakdown for this role
  const matchBreakdown = computeMatchScore(currentUser, project, selectedRoleId);
  const skillGapData = computeTeamSkillGapRadar(project);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || isOwner || isPaused || isClosed) return;
    setIsApplying(true);

    setTimeout(() => {
      onSubmitApplication(
        project.id,
        selectedRole.id,
        selectedRole.title,
        applicationNote || `Hi ${project.owner.name.split(' ')[0]}, I'd love to join as ${selectedRole.title} and collaborate on ${project.title}!`
      );
      setIsApplying(false);
      setShowApplyForm(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#08080A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Top Header */}
        <div className="p-6 border-b border-white/5 flex items-start justify-between gap-4 bg-[#08080A]">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-3 py-0.5 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 text-[#14b8a6] font-bold text-[11px]">
                {project.projectType}
              </span>
              <span className="text-white/60 font-medium">{project.domain}</span>
              <span className="text-white/20">•</span>
              <span className="text-white/40">{project.difficulty} Level</span>
              
              {/* Recruitment Status Pill */}
              {isPaused ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[11px] flex items-center gap-1">
                  <PauseCircle className="w-3 h-3" /> Recruitment Paused
                </span>
              ) : isClosed ? (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold text-[11px] flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Recruitment Closed
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Recruitment
                </span>
              )}

              {project.deadline && (
                <>
                  <span className="text-white/20">•</span>
                  <span className="text-amber-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {project.deadline}
                  </span>
                </>
              )}
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {project.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/50">
              {project.tagline}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          
          {/* Owner Notice Banner */}
          {isOwner && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200">
              <div className="flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-sm">You are the Owner of this project</div>
                  <p className="text-amber-200/70 text-xs mt-0.5">
                    As project creator, you cannot apply to your own roles. Manage applicants, pause recruitment, and review AI-recommended companions in the Builder Hub.
                  </p>
                </div>
              </div>
              {onSwitchToOwnerMode && (
                <button
                  onClick={() => {
                    onClose();
                    onSwitchToOwnerMode();
                  }}
                  className="px-4 py-2 rounded-full bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors shrink-0 cursor-pointer shadow-md"
                >
                  Open Builder Hub
                </button>
              )}
            </div>
          )}

          {/* Recruitment Paused or Closed Notice */}
          {!isOwner && isPaused && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-200">
              <PauseCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Recruitment is Temporarily Paused</span>
                <span className="text-amber-200/70">The project owner is currently reviewing applicants and has paused new submissions.</span>
              </div>
            </div>
          )}

          {!isOwner && isClosed && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-200">
              <Lock className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Recruitment Closed / Squad Full</span>
                <span className="text-rose-200/70">All companion spots for this project have been filled.</span>
              </div>
            </div>
          )}

          {/* Main Description */}
          <div>
            <h3 className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
              Project Vision & Scope
            </h3>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed whitespace-pre-line bg-white/5 p-4 rounded-2xl border border-white/5">
              {project.description}
            </p>
          </div>

          {/* Compatibility Breakdown Card */}
          <div className="p-6 rounded-2xl bg-white/5 border border-[#14b8a6]/30 glow-accent relative">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#14b8a6] bg-[#14b8a6]/10 border border-[#14b8a6]/20 px-3 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" /> 5-Factor Compatibility Score
                  </div>
                  <MatchScoreInfoButton
                    score={matchBreakdown.overallScore}
                    breakdown={matchBreakdown}
                    variant="circle"
                    size="xs"
                  />
                </div>
                <div className="text-base font-semibold text-white">
                  Fit for: <span className="text-[#14b8a6]">{selectedRole ? selectedRole.title : 'Project Companion'}</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  {matchBreakdown.explanation}
                </p>
              </div>

              <div className="shrink-0 flex flex-col items-center">
                <MatchGauge
                  score={matchBreakdown.overallScore}
                  size="hero"
                  showInfoButton
                  breakdown={matchBreakdown}
                />
              </div>

            </div>

            {/* Detailed Factor Bars with Info triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/5 text-xs">
              <div className="p-3 rounded-xl bg-[#08080A] border border-white/5 group hover:border-[#14b8a6]/30 transition-colors">
                <div className="flex justify-between items-center text-white/50 mb-1.5 text-xs font-medium">
                  <span className="flex items-center gap-1">
                    Skill Overlap (40%)
                    <MatchScoreInfoButton score={matchBreakdown.overallScore} breakdown={matchBreakdown} size="xs" />
                  </span>
                  <span className="text-[#14b8a6] font-bold">{matchBreakdown.skillOverlapScore}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-[#14b8a6]" style={{ width: `${matchBreakdown.skillOverlapScore}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#08080A] border border-white/5 group hover:border-indigo-500/30 transition-colors">
                <div className="flex justify-between items-center text-white/50 mb-1.5 text-xs font-medium">
                  <span className="flex items-center gap-1">
                    Role Fit (20%)
                    <MatchScoreInfoButton score={matchBreakdown.overallScore} breakdown={matchBreakdown} size="xs" />
                  </span>
                  <span className="text-indigo-400 font-bold">{matchBreakdown.roleFitScore}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-[#6366f1]" style={{ width: `${matchBreakdown.roleFitScore}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#08080A] border border-white/5 group hover:border-emerald-500/30 transition-colors">
                <div className="flex justify-between items-center text-white/50 mb-1.5 text-xs font-medium">
                  <span className="flex items-center gap-1">
                    Availability (15%)
                    <MatchScoreInfoButton score={matchBreakdown.overallScore} breakdown={matchBreakdown} size="xs" />
                  </span>
                  <span className="text-emerald-400 font-bold">{matchBreakdown.availabilityScore}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${matchBreakdown.availabilityScore}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#08080A] border border-white/5 group hover:border-sky-500/30 transition-colors">
                <div className="flex justify-between items-center text-white/50 mb-1.5 text-xs font-medium">
                  <span className="flex items-center gap-1">
                    Experience Fit (15%)
                    <MatchScoreInfoButton score={matchBreakdown.overallScore} breakdown={matchBreakdown} size="xs" />
                  </span>
                  <span className="text-sky-400 font-bold">{matchBreakdown.experienceFitScore}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-sky-400" style={{ width: `${matchBreakdown.experienceFitScore}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Grid: Open Roles & Team Skill Gap Radar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Open Roles */}
            <div className="md:col-span-7 space-y-3">
              <h3 className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                Open Roles ({project.openRoles.length})
              </h3>
              
              <div className="space-y-3">
                {project.openRoles.map((role) => {
                  const isSelected = selectedRoleId === role.id;
                  return (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRoleId(role.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/10 border-[#14b8a6] shadow-[0_0_15px_rgba(20,184,166,0.2)]'
                          : 'bg-white/5 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-display font-bold text-sm text-white">
                          {role.title}
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#14b8a6]/10 text-[#14b8a6] border border-[#14b8a6]/20">
                          {role.spots - role.filled} {role.spots - role.filled === 1 ? 'spot' : 'spots'} left
                        </span>
                      </div>

                      <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
                        {role.description}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {role.requiredSkills.map((sk) => {
                          const hasSkill = currentUser.skills.some(
                            (us) => us.name.toLowerCase() === sk.toLowerCase()
                          );
                          return (
                            <span
                              key={sk}
                              className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${
                                hasSkill
                                  ? 'bg-[#14b8a6]/15 text-[#14b8a6] border-[#14b8a6]/30 font-bold'
                                  : 'bg-[#08080A] text-white/40 border-white/5'
                              }`}
                            >
                              {hasSkill && '✓ '}
                              {sk}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team Radar & Members */}
            <div className="md:col-span-5 space-y-4">
              <h3 className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                Team Skill Gap Radar
              </h3>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center flex flex-col items-center">
                <SkillGapRadar data={skillGapData} size={220} />
              </div>

              {/* Current Members */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Current Squad ({project.team.length + 1})
                </div>

                <div 
                  onClick={() => onViewCandidate(project.owner)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <img src={project.owner.avatar} alt={project.owner.name} className="w-6 h-6 rounded-full object-cover" />
                      <StatusDot status={project.owner.availability} size="sm" className="absolute -bottom-0.5 -right-0.5" />
                    </div>
                    <span className="text-xs text-white font-medium">{project.owner.name}</span>
                  </div>
                  <span className="text-[10px] text-[#14b8a6] bg-[#14b8a6]/10 px-2 py-0.5 rounded-full border border-[#14b8a6]/20 font-bold">
                    Owner
                  </span>
                </div>

                {project.team.map((m) => (
                  <div
                    key={m.userId}
                    onClick={() => onViewCandidate(m.user)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <img src={m.user.avatar} alt={m.user.name} className="w-6 h-6 rounded-full object-cover" />
                        <StatusDot status={m.user.availability} size="sm" className="absolute -bottom-0.5 -right-0.5" />
                      </div>
                      <span className="text-xs text-white font-medium">{m.user.name}</span>
                    </div>
                    <span className="text-[10px] text-white/40">{m.roleTitle}</span>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Application Form Section */}
          {showApplyForm && !existingApplication && !isOwner && !isPaused && !isClosed && (
            <div className="p-5 rounded-2xl bg-white/5 border border-[#14b8a6]/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#14b8a6]" />
                  <span>Apply for {selectedRole?.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  className="text-xs text-white/40 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleApply} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1">
                    Introduction note for {project.owner.name.split(' ')[0]}:
                  </label>
                  <textarea
                    rows={3}
                    value={applicationNote}
                    onChange={(e) => setApplicationNote(e.target.value)}
                    placeholder={`Hi ${project.owner.name.split(' ')[0]}, I'm excited about this project because...`}
                    className="w-full p-3 rounded-xl bg-[#08080A] border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#14b8a6]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    {isApplying ? (
                      <span>Sending Application...</span>
                    ) : (
                      <>
                        <span>Submit Application ({matchBreakdown.overallScore}% Match)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-white/5 bg-[#08080A] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span className="font-semibold text-white/80">Commitment:</span>
            <span>{project.commitmentHours} hours/week</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              Close
            </button>

            {isOwner ? (
              <div className="px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300 flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Project Owner (Cannot Apply)</span>
              </div>
            ) : existingApplication ? (
              <div className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                existingApplication.status === 'accepted'
                  ? 'bg-[#14b8a6]/20 border-[#14b8a6]/40 text-[#14b8a6]'
                  : existingApplication.status === 'waitlisted'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : existingApplication.status === 'declined'
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-sky-500/20 border-sky-500/40 text-sky-300'
              }`}>
                {existingApplication.status === 'accepted' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#14b8a6]" />
                ) : existingApplication.status === 'waitlisted' ? (
                  <Hourglass className="w-3.5 h-3.5 text-amber-300" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Application {existingApplication.status}</span>
              </div>
            ) : isPaused ? (
              <div className="px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300 flex items-center gap-2">
                <PauseCircle className="w-4 h-4 text-amber-400" />
                <span>Applications Paused</span>
              </div>
            ) : isClosed ? (
              <div className="px-5 py-2 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400" />
                <span>Recruitment Closed</span>
              </div>
            ) : !showApplyForm ? (
              <button
                onClick={() => setShowApplyForm(true)}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white font-bold text-xs shadow-lg glow-accent transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>Want to Contribute ({selectedRole?.title})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>

      </div>
    </div>
  );
};
