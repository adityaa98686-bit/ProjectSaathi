import React, { useState, useMemo } from 'react';
import { 
  PlusCircle, 
  Layers, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  UserPlus,
  UserMinus,
  Hourglass,
  PauseCircle,
  PlayCircle,
  Lock,
  Search,
  Filter,
  Send,
  Trash2,
  RefreshCw,
  Crown,
  Check,
  X,
  Compass,
  Mail,
  MessageSquare,
  BookmarkCheck
} from 'lucide-react';
import { Project, Application, UserProfile, RadarDataPoint, RecruitmentStatus, ProjectInvitation } from '../types';
import { MatchGauge } from './MatchGauge';
import { StatusDot } from './StatusDot';
import { SkillGapRadar } from './SkillGapRadar';
import { ThemeToggle } from './ThemeToggle';
import { computeTeamSkillGapRadar, computeMatchScore } from '../utils/matchingEngine';

interface OwnerDashboardProps {
  currentUser: UserProfile;
  myProjects: Project[];
  allApplications: Application[];
  allUsers: UserProfile[];
  invitations?: ProjectInvitation[];
  onOpenPostProject: () => void;
  onViewCandidate: (user: UserProfile) => void;
  onAcceptApplicant: (applicationId: string) => void;
  onWaitlistApplicant: (applicationId: string) => void;
  onDeclineApplicant: (applicationId: string) => void;
  onRemoveApplicant: (applicationId: string) => void;
  onRemoveTeamMember: (projectId: string, userId: string) => void;
  onUpdateProjectStatus: (projectId: string, status: RecruitmentStatus) => void;
  onInviteCandidate: (candidateId: string, projectId: string, roleTitle?: string, note?: string) => void;
  onSendMessage?: (invitationId: string, text: string) => void;
  onSelectProjectDetail: (project: Project) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  currentUser,
  myProjects = [],
  allApplications = [],
  allUsers = [],
  invitations = [],
  onOpenPostProject,
  onViewCandidate,
  onAcceptApplicant,
  onWaitlistApplicant,
  onDeclineApplicant,
  onRemoveApplicant,
  onRemoveTeamMember,
  onUpdateProjectStatus,
  onInviteCandidate,
  onSendMessage,
  onSelectProjectDetail,
}) => {
  const safeProjects = myProjects || [];
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    safeProjects[0]?.id || ''
  );

  // Right pane tab: 'applicants' | 'recommended' | 'explore' | 'invitations'
  const [activeTab, setActiveTab] = useState<'applicants' | 'recommended' | 'explore' | 'invitations'>('applicants');
  
  // Applicant status filter
  const [applicantFilter, setApplicantFilter] = useState<'all' | 'pending' | 'waitlisted' | 'accepted' | 'declined'>('all');

  // Explore search & filters
  const [exploreQuery, setExploreQuery] = useState<string>('');
  const [exploreRoleFilter, setExploreRoleFilter] = useState<string>('all');
  const [exploreAvailFilter, setExploreAvailFilter] = useState<string>('all');

  // Quick invite modal state
  const [inviteModalCandidate, setInviteModalCandidate] = useState<UserProfile | null>(null);
  const [inviteSelectedRole, setInviteSelectedRole] = useState<string>('');
  const [inviteCustomNote, setInviteCustomNote] = useState<string>('');
  const [invitedCandidateIds, setInvitedCandidateIds] = useState<Record<string, boolean>>({});

  // Active chat in invitations tab
  const [activeOwnerChatInviteId, setActiveOwnerChatInviteId] = useState<string | null>(null);
  const [ownerReplyText, setOwnerReplyText] = useState<string>('');

  // Removal confirmation dialog state
  const [confirmRemoveMember, setConfirmRemoveMember] = useState<{ userId: string; name: string; roleTitle: string } | null>(null);

  const activeProject = safeProjects.find((p) => p.id === selectedProjectId) || safeProjects[0];

  // Applications for the active project
  const projectApplications = useMemo(() => {
    if (!activeProject) return [];
    return allApplications
      .filter((app) => app.projectId === activeProject.id)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [allApplications, activeProject]);

  // Filtered applications by status
  const filteredApplications = useMemo(() => {
    if (applicantFilter === 'all') return projectApplications;
    return projectApplications.filter((app) => app.status === applicantFilter);
  }, [projectApplications, applicantFilter]);

  // Compute Skill Gap Radar data for the current team
  const skillGapData: RadarDataPoint[] = activeProject 
    ? computeTeamSkillGapRadar(activeProject)
    : [];

  // Team member user IDs for exclusion in recommendations
  const currentTeamUserIds = useMemo(() => {
    if (!activeProject) return new Set<string>();
    const ids = new Set<string>();
    ids.add(activeProject.ownerId);
    activeProject.team.forEach((m) => ids.add(m.userId));
    return ids;
  }, [activeProject]);

  // Auto-Recommended profiles calculated from all companions for the active project
  const recommendedCandidates = useMemo(() => {
    if (!activeProject) return [];
    
    // Filter out existing team members and the owner
    const candidates = allUsers.filter((u) => !currentTeamUserIds.has(u.id));

    // Calculate match scores against the active project
    return candidates
      .map((candidate) => {
        const match = computeMatchScore(candidate, activeProject);
        // Find best fitting open role
        let bestRole = activeProject.openRoles[0];
        let highestRoleFit = 0;
        
        activeProject.openRoles.forEach((role) => {
          const roleMatch = computeMatchScore(candidate, activeProject, role.id);
          if (roleMatch.overallScore > highestRoleFit) {
            highestRoleFit = roleMatch.overallScore;
            bestRole = role;
          }
        });

        return {
          candidate,
          matchScore: match.overallScore,
          matchBreakdown: match,
          bestRole,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [allUsers, activeProject, currentTeamUserIds]);

  // Explore candidates filtered by search & parameters
  const exploreCandidates = useMemo(() => {
    if (!activeProject) return [];

    return recommendedCandidates.filter(({ candidate }) => {
      const matchesQuery = 
        !exploreQuery ||
        candidate.name.toLowerCase().includes(exploreQuery.toLowerCase()) ||
        candidate.headline.toLowerCase().includes(exploreQuery.toLowerCase()) ||
        candidate.primaryRole.toLowerCase().includes(exploreQuery.toLowerCase()) ||
        candidate.skills.some((s) => s.name.toLowerCase().includes(exploreQuery.toLowerCase()));

      const matchesRole = 
        exploreRoleFilter === 'all' || 
        candidate.primaryRole.toLowerCase().includes(exploreRoleFilter.toLowerCase());

      const matchesAvail = 
        exploreAvailFilter === 'all' || 
        candidate.availability === exploreAvailFilter;

      return matchesQuery && matchesRole && matchesAvail;
    });
  }, [recommendedCandidates, exploreQuery, exploreRoleFilter, exploreAvailFilter, activeProject]);

  // Outgoing invitations for the active project
  const projectInvitations = useMemo(() => {
    if (!activeProject) return [];
    return invitations.filter((inv) => inv.projectId === activeProject.id);
  }, [invitations, activeProject]);

  const handleOpenInvite = (candidate: UserProfile) => {
    setInviteModalCandidate(candidate);
    setInviteSelectedRole(activeProject?.openRoles[0]?.title || 'Companion Member');
    setInviteCustomNote(`Hi ${candidate.name.split(' ')[0]}, I checked out your profile and think you'd be a fantastic fit for ${activeProject?.title}!`);
  };

  const handleSendInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteModalCandidate || !activeProject) return;

    onInviteCandidate(
      inviteModalCandidate.id,
      activeProject.id,
      inviteSelectedRole,
      inviteCustomNote
    );

    setInvitedCandidateIds((prev) => ({ ...prev, [inviteModalCandidate.id]: true }));
    setInviteModalCandidate(null);
  };

  const handleOwnerReplySubmit = (e: React.FormEvent, invitationId: string) => {
    e.preventDefault();
    if (!ownerReplyText.trim() || !onSendMessage) return;

    onSendMessage(invitationId, ownerReplyText.trim());
    setOwnerReplyText('');
  };

  const handleStatusChange = (newStatus: RecruitmentStatus) => {
    if (!activeProject) return;
    onUpdateProjectStatus(activeProject.id, newStatus);
  };

  const currentRecruitmentStatus: RecruitmentStatus = activeProject?.recruitmentStatus || 'active';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Project Builder Hub
            </h1>
            <span className="px-3 py-1 rounded-full bg-[#6366f1]/10 text-indigo-300 text-xs font-semibold border border-[#6366f1]/30">
              {myProjects.length} Managed {myProjects.length === 1 ? 'Project' : 'Projects'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Recruit companions, review ranked applicants, manage squad waitlists, and explore AI-matched talent.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle variant="pill" showLabel />
          <button
            onClick={onOpenPostProject}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white font-bold text-xs shadow-lg glow-accent transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-white stroke-[2.5]" />
            <span>Post New Project</span>
          </button>
        </div>
      </div>

      {myProjects.length === 0 ? (
        /* Empty State */
        <div className="p-12 rounded-2xl bg-white/5 border border-white/5 text-center max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#14b8a6]/10 border border-[#14b8a6]/30 flex items-center justify-center text-[#14b8a6] mx-auto mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="font-display text-xl font-bold text-white">
            You haven't posted any projects yet
          </h2>
          <p className="text-xs text-white/50 mt-2 leading-relaxed">
            Create a project post to let our compatibility engine surface the best developers, designers, and researchers matching your exact skill requirements.
          </p>
          <button
            onClick={onOpenPostProject}
            className="mt-6 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Your First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: My Projects Selector, Status Controls & Squad Management */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Project Switcher List */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Select Project
                </span>
                <span className="text-xs text-white/40">
                  {myProjects.length} Managed
                </span>
              </div>

              <div className="space-y-2">
                {myProjects.map((p) => {
                  const pApps = allApplications.filter((a) => a.projectId === p.id);
                  const isSelected = activeProject?.id === p.id;
                  const pStatus = p.recruitmentStatus || 'active';

                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      className={`w-full p-4 rounded-2xl text-left transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-white/10 border-[#14b8a6] shadow-lg glow-subtle'
                          : 'bg-[#08080A] border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-bold text-sm text-white truncate">
                          {p.title}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {pStatus === 'paused' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              Paused
                            </span>
                          )}
                          {pStatus === 'closed' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              Closed
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#14b8a6]/10 text-[#14b8a6] border border-[#14b8a6]/20">
                            {pApps.length} {pApps.length === 1 ? 'Applicant' : 'Applicants'}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-white/50 mt-1 truncate">
                        {p.domain} • {p.projectType}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-white/5">
                        <span>Team: {p.team.length + 1}/{p.maxTeamSize}</span>
                        <span className="text-[#14b8a6] font-medium">{p.openRoles.length} open roles</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Project Recruitment Controls */}
            {activeProject && (
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                    Recruitment Control Panel
                  </span>
                  <span className="text-xs font-semibold text-white/80">
                    Status: <strong className={currentRecruitmentStatus === 'active' ? 'text-emerald-400' : currentRecruitmentStatus === 'paused' ? 'text-amber-400' : 'text-rose-400'}>{currentRecruitmentStatus.toUpperCase()}</strong>
                  </span>
                </div>

                {/* 3-State Toggle Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStatusChange('active')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      currentRecruitmentStatus === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : 'bg-[#08080A] text-white/40 border border-white/5 hover:border-white/20'
                    }`}
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Recruiting</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange('paused')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      currentRecruitmentStatus === 'paused'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        : 'bg-[#08080A] text-white/40 border border-white/5 hover:border-white/20'
                    }`}
                  >
                    <PauseCircle className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange('closed')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      currentRecruitmentStatus === 'closed'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                        : 'bg-[#08080A] text-white/40 border border-white/5 hover:border-white/20'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Close</span>
                  </button>
                </div>

                <div className="text-[11px] text-white/50 leading-relaxed bg-[#08080A] p-3 rounded-xl border border-white/5">
                  {currentRecruitmentStatus === 'active' && (
                    <span className="text-emerald-300">
                      ✓ Project is actively accepting applications. Contributor matchmaking is live.
                    </span>
                  )}
                  {currentRecruitmentStatus === 'paused' && (
                    <span className="text-amber-300">
                      ⏸️ New applications are temporarily blocked. Existing applicants remain visible for review.
                    </span>
                  )}
                  {currentRecruitmentStatus === 'closed' && (
                    <span className="text-rose-300">
                      🔒 Recruitment is closed. Open role listings show squad full status.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Signature Team Skill Gap Radar */}
            {activeProject && (
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-left">
                    <h3 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#14b8a6]" />
                      Team Skill Gap Radar
                    </h3>
                    <p className="text-[11px] text-white/40">
                      Plots required archetypes vs current team coverage.
                    </p>
                  </div>
                </div>

                <div className="py-2">
                  <SkillGapRadar
                    data={skillGapData}
                    size={260}
                    requiredLabel="Required Need"
                    coveredLabel="Current Team"
                  />
                </div>

                {/* Squad Members List with Remove Capability */}
                <div className="mt-4 pt-3 border-t border-white/5 text-left text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                      Current Squad ({activeProject.team.length + 1}/{activeProject.maxTeamSize})
                    </div>
                    <span className="text-[10px] text-[#14b8a6] font-medium">
                      {activeProject.maxTeamSize - (activeProject.team.length + 1)} spots open
                    </span>
                  </div>
                  
                  {/* Owner */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#08080A] border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <img
                          src={activeProject.owner.avatar}
                          alt={activeProject.owner.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <StatusDot
                          status={activeProject.owner.availability}
                          size="sm"
                          className="absolute -bottom-0.5 -right-0.5"
                        />
                      </div>
                      <span className="text-xs text-white font-medium">{activeProject.owner.name}</span>
                    </div>
                    <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" /> Owner
                    </span>
                  </div>

                  {/* Accepted Team Members with Remove Button */}
                  {activeProject.team.length === 0 ? (
                    <div className="p-3 text-center text-xs text-white/40 bg-[#08080A] rounded-xl border border-dashed border-white/10">
                      No additional members yet. Accept applicants or invite recommended companions.
                    </div>
                  ) : (
                    activeProject.team.map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#08080A] border border-white/5 group hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <img
                              src={member.user.avatar}
                              alt={member.user.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <StatusDot
                              status={member.user.availability}
                              size="sm"
                              className="absolute -bottom-0.5 -right-0.5"
                            />
                          </div>
                          <div>
                            <span className="text-xs text-white font-medium block">{member.user.name}</span>
                            <span className="text-[10px] text-white/40">{member.roleTitle}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onViewCandidate(member.user)}
                            className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/5 text-xs transition-colors cursor-pointer"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => setConfirmRemoveMember({
                              userId: member.userId,
                              name: member.user.name,
                              roleTitle: member.roleTitle
                            })}
                            className="p-1 rounded-md text-rose-400/60 hover:text-rose-300 hover:bg-rose-500/10 text-xs transition-colors cursor-pointer flex items-center gap-1"
                            title="Remove from Squad"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            <span className="text-[10px] hidden group-hover:inline font-medium">Remove</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Multi-Tab Hub (Applicants, AI Auto-Recommended, Explore) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Tab Navigation Header */}
            <div className="p-2 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setActiveTab('applicants')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'applicants'
                      ? 'bg-gradient-to-r from-[#6366f1] to-[#14b8a6] text-white shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Ranked Applicants</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                    {projectApplications.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('recommended')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'recommended'
                      ? 'bg-gradient-to-r from-[#6366f1] to-[#14b8a6] text-white shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Auto-Recommended</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                    {recommendedCandidates.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('explore')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'explore'
                      ? 'bg-gradient-to-r from-[#6366f1] to-[#14b8a6] text-white shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Explore Candidates</span>
                </button>

                <button
                  onClick={() => setActiveTab('invitations')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'invitations'
                      ? 'bg-gradient-to-r from-[#6366f1] to-[#14b8a6] text-white shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>Invitations & Doubts</span>
                  {projectInvitations.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                      {projectInvitations.length}
                    </span>
                  )}
                </button>
              </div>

              {activeProject && (
                <button
                  onClick={() => onSelectProjectDetail(activeProject)}
                  className="text-xs text-[#14b8a6] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer px-3 py-1.5"
                >
                  <span>Public View</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* TAB 1: RANKED APPLICANTS */}
            {activeTab === 'applicants' && (
              <div className="space-y-4">
                
                {/* Filter Chips for Applicants */}
                <div className="flex items-center gap-2 flex-wrap text-xs pb-1">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider mr-1">Status:</span>
                  {(['all', 'pending', 'waitlisted', 'accepted', 'declined'] as const).map((st) => {
                    const count = st === 'all' 
                      ? projectApplications.length 
                      : projectApplications.filter((a) => a.status === st).length;

                    return (
                      <button
                        key={st}
                        onClick={() => setApplicantFilter(st)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                          applicantFilter === st
                            ? 'bg-white text-black font-bold'
                            : 'bg-white/5 text-white/50 hover:text-white border border-white/5'
                        }`}
                      >
                        {st} ({count})
                      </button>
                    );
                  })}
                </div>

                {filteredApplications.length === 0 ? (
                  <div className="p-10 rounded-2xl bg-white/5 border border-white/5 text-center space-y-3">
                    <Users className="w-8 h-8 text-white/30 mx-auto" />
                    <h3 className="font-display text-base font-bold text-white">
                      No {applicantFilter !== 'all' ? applicantFilter : ''} applicants found
                    </h3>
                    <p className="text-xs text-white/40 max-w-sm mx-auto">
                      {applicantFilter === 'all' 
                        ? 'Your project is live in the Contributor feed. Matching companions will appear here as they apply.'
                        : `No applicants currently hold the '${applicantFilter}' status.`}
                    </p>
                    {applicantFilter !== 'all' && (
                      <button
                        onClick={() => setApplicantFilter('all')}
                        className="px-3.5 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold hover:bg-white/15"
                      >
                        View All Applicants
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredApplications.map((app, index) => {
                      const applicant = app.applicant;
                      return (
                        <div
                          key={app.id}
                          className={`p-5 rounded-2xl bg-white/5 border transition-all ${
                            app.status === 'accepted'
                              ? 'border-[#14b8a6]/40 bg-[#14b8a6]/5'
                              : app.status === 'waitlisted'
                              ? 'border-amber-500/30 bg-amber-500/5'
                              : app.status === 'declined'
                              ? 'border-rose-900/40 opacity-60'
                              : 'border-white/5 hover:border-white/15'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            
                            {/* Candidate Info */}
                            <div className="flex items-start gap-3.5 flex-1">
                              <div className="relative shrink-0 mt-0.5">
                                <img
                                  src={applicant.avatar}
                                  alt={applicant.name}
                                  className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                                />
                                <StatusDot
                                  status={applicant.availability}
                                  size="md"
                                  className="absolute -bottom-1 -right-1"
                                />
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-display font-bold text-base text-white hover:text-[#14b8a6] cursor-pointer" onClick={() => onViewCandidate(applicant)}>
                                    {applicant.name}
                                  </span>
                                  <span className="text-xs text-white/50">
                                    • Role: <strong className="text-[#14b8a6] font-semibold">{app.roleTitle}</strong>
                                  </span>

                                  {/* Status Pill */}
                                  {app.status === 'waitlisted' && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                      <Hourglass className="w-3 h-3" /> Waitlisted
                                    </span>
                                  )}
                                  {app.status === 'accepted' && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#14b8a6]/20 text-[#14b8a6] border border-[#14b8a6]/40 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" /> Squad Member
                                    </span>
                                  )}
                                  {app.status === 'declined' && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                                      <XCircle className="w-3 h-3" /> Declined
                                    </span>
                                  )}
                                </div>

                                <div className="text-xs text-white/50">
                                  {applicant.headline}
                                </div>

                                <div className="flex items-center gap-2 pt-1 text-[11px] text-white/40">
                                  <span className="text-[#14b8a6] font-bold">
                                    {applicant.experienceLevel} Tier
                                  </span>
                                  <span>•</span>
                                  <span>{applicant.hoursPerWeek} hrs/week</span>
                                  <span>•</span>
                                  <span className="text-white/40">{app.appliedAt}</span>
                                </div>
                              </div>
                            </div>

                            {/* Animated Match Gauge for this applicant */}
                            <div className="shrink-0 flex sm:flex-col items-center gap-2 self-center sm:self-start">
                              <MatchGauge score={app.matchScore} size="md" showInfoButton />
                              <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">
                                Rank #{index + 1}
                              </span>
                            </div>

                          </div>

                          {/* Application Note */}
                          {app.note && (
                            <div className="mt-3.5 p-3 rounded-xl bg-[#08080A] border border-white/5 text-xs text-white/70 leading-relaxed italic">
                              "{app.note}"
                            </div>
                          )}

                          {/* Plain-English breakdown */}
                          <div className="mt-2.5 text-xs text-[#14b8a6] bg-[#14b8a6]/10 border border-[#14b8a6]/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#14b8a6] shrink-0" />
                            <span>{app.matchBreakdown.explanation}</span>
                          </div>

                          {/* Candidate Skills Pills */}
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {applicant.skills.slice(0, 5).map((sk) => {
                              const isReq = activeProject?.requiredSkills.some(
                                (rs) => rs.toLowerCase() === sk.name.toLowerCase()
                              );
                              return (
                                <span
                                  key={sk.name}
                                  className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${
                                    isReq
                                      ? 'bg-[#14b8a6]/10 text-[#14b8a6] border-[#14b8a6]/30'
                                      : 'bg-white/5 text-white/40 border-white/5'
                                  }`}
                                >
                                  {isReq && '✓ '}
                                  {sk.name}
                                </span>
                              );
                            })}
                          </div>

                          {/* Action Controls Bar */}
                          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-3">
                            <button
                              onClick={() => onViewCandidate(applicant)}
                              className="text-xs text-white/60 hover:text-white flex items-center gap-1.5 font-medium cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#14b8a6]" />
                              <span>View Full Profile & Skills</span>
                            </button>

                            <div className="flex items-center gap-2 flex-wrap">
                              {app.status === 'accepted' ? (
                                <>
                                  <span className="px-3.5 py-1.5 rounded-full bg-[#14b8a6]/20 text-[#14b8a6] border border-[#14b8a6]/40 text-xs font-bold flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Accepted to Squad
                                  </span>
                                  <button
                                    onClick={() => onRemoveTeamMember(activeProject.id, applicant.id)}
                                    className="px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <UserMinus className="w-3.5 h-3.5" />
                                    <span>Remove from Squad</span>
                                  </button>
                                </>
                              ) : app.status === 'waitlisted' ? (
                                <>
                                  <button
                                    onClick={() => onDeclineApplicant(app.id)}
                                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-white/60 hover:text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
                                  >
                                    Decline
                                  </button>
                                  <button
                                    onClick={() => onAcceptApplicant(app.id)}
                                    className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                    <span>Promote to Team</span>
                                  </button>
                                </>
                              ) : app.status === 'declined' ? (
                                <>
                                  <span className="px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5">
                                    <XCircle className="w-3.5 h-3.5" /> Declined
                                  </span>
                                  <button
                                    onClick={() => onWaitlistApplicant(app.id)}
                                    className="px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <Hourglass className="w-3 h-3" />
                                    <span>Reconsider / Waitlist</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  {/* Pending Action Trio: Decline, Waitlist, Accept */}
                                  <button
                                    onClick={() => onDeclineApplicant(app.id)}
                                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-white/60 hover:text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
                                  >
                                    Decline
                                  </button>
                                  <button
                                    onClick={() => onWaitlistApplicant(app.id)}
                                    className="px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <Hourglass className="w-3 h-3" />
                                    <span>Waitlist</span>
                                  </button>
                                  <button
                                    onClick={() => onAcceptApplicant(app.id)}
                                    className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                                    <span>Accept to Team</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: AUTO-RECOMMENDED COMPANIONS */}
            {activeTab === 'recommended' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#6366f1]/10 via-white/5 to-transparent border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      AI Auto-Recommended Candidates for {activeProject?.title}
                    </h3>
                    <p className="text-xs text-white/50 mt-0.5">
                      Surfacing top verified profiles matching your open roles: {activeProject?.openRoles.map((r) => r.title).join(', ')}.
                    </p>
                  </div>
                </div>

                {recommendedCandidates.length === 0 ? (
                  <div className="p-10 rounded-2xl bg-white/5 border border-white/5 text-center space-y-3">
                    <Sparkles className="w-8 h-8 text-white/30 mx-auto" />
                    <h3 className="font-display text-base font-bold text-white">
                      All candidates have joined or applied
                    </h3>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendedCandidates.map(({ candidate, matchScore, matchBreakdown, bestRole }) => {
                      const isInvited = invitedCandidateIds[candidate.id];

                      return (
                        <div
                          key={candidate.id}
                          className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#14b8a6]/40 transition-all group"
                        >
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            
                            <div className="flex items-start gap-3.5 flex-1">
                              <div className="relative shrink-0 mt-0.5">
                                <img
                                  src={candidate.avatar}
                                  alt={candidate.name}
                                  className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                                />
                                <StatusDot
                                  status={candidate.availability}
                                  size="md"
                                  className="absolute -bottom-1 -right-1"
                                />
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    onClick={() => onViewCandidate(candidate)}
                                    className="font-display font-bold text-base text-white hover:text-[#14b8a6] cursor-pointer"
                                  >
                                    {candidate.name}
                                  </span>
                                  {candidate.isLinkedinVerified && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-950/80 text-sky-300 border border-sky-800">
                                      <ShieldCheck className="w-3 h-3 text-sky-400" /> LinkedIn
                                    </span>
                                  )}
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#6366f1]/15 text-indigo-300 border border-[#6366f1]/30">
                                    Recommended for: {bestRole.title}
                                  </span>
                                </div>

                                <div className="text-xs text-white/50">
                                  {candidate.headline}
                                </div>

                                <div className="flex items-center gap-2 pt-1 text-[11px] text-white/40">
                                  <span className="text-[#14b8a6] font-bold">
                                    {candidate.experienceLevel} Tier
                                  </span>
                                  <span>•</span>
                                  <span>{candidate.hoursPerWeek} hrs/week</span>
                                  <span>•</span>
                                  <StatusDot status={candidate.availability} showLabel size="sm" />
                                </div>
                              </div>
                            </div>

                            {/* Match score gauge */}
                            <div className="shrink-0 flex sm:flex-col items-center gap-2 self-center sm:self-start">
                              <MatchGauge score={matchScore} size="md" showInfoButton breakdown={matchBreakdown} />
                            </div>

                          </div>

                          {/* Match justification */}
                          <div className="mt-3 p-3 rounded-xl bg-[#08080A] border border-white/5 text-xs text-white/70 leading-relaxed">
                            <span className="text-[#14b8a6] font-bold block mb-0.5">
                              Match Justification:
                            </span>
                            {matchBreakdown.explanation}
                          </div>

                          {/* Candidate Skills */}
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {candidate.skills.slice(0, 5).map((sk) => {
                              const isReq = activeProject?.requiredSkills.some(
                                (rs) => rs.toLowerCase() === sk.name.toLowerCase()
                              );
                              return (
                                <span
                                  key={sk.name}
                                  className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${
                                    isReq
                                      ? 'bg-[#14b8a6]/10 text-[#14b8a6] border-[#14b8a6]/30'
                                      : 'bg-white/5 text-white/40 border-white/5'
                                  }`}
                                >
                                  {isReq && '✓ '}
                                  {sk.name}
                                </span>
                              );
                            })}
                          </div>

                          {/* Actions */}
                          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-3">
                            <button
                              onClick={() => onViewCandidate(candidate)}
                              className="text-xs text-white/60 hover:text-white flex items-center gap-1.5 font-medium cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#14b8a6]" />
                              <span>View Profile & Radar</span>
                            </button>

                            {isInvited ? (
                              <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5" /> Invitation Sent
                              </span>
                            ) : (
                              <button
                                onClick={() => handleOpenInvite(candidate)}
                                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                              >
                                <UserPlus className="w-3.5 h-3.5 text-white" />
                                <span>Invite to Project</span>
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: EXPLORE CANDIDATES */}
            {activeTab === 'explore' && (
              <div className="space-y-4">
                {/* Search and Filters Bar */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={exploreQuery}
                      onChange={(e) => setExploreQuery(e.target.value)}
                      placeholder="Search candidates by name, skills (e.g. React, PyTorch, UX), or role..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#08080A] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#14b8a6]"
                    />
                  </div>

                  <div className="flex items-center gap-3 flex-wrap text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Role:</span>
                      <select
                        value={exploreRoleFilter}
                        onChange={(e) => setExploreRoleFilter(e.target.value)}
                        className="bg-[#08080A] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/80 focus:outline-none"
                      >
                        <option value="all">All Roles</option>
                        <option value="Engineer">Engineers</option>
                        <option value="Designer">Designers</option>
                        <option value="Researcher">Researchers</option>
                        <option value="AI">AI / ML</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Availability:</span>
                      <select
                        value={exploreAvailFilter}
                        onChange={(e) => setExploreAvailFilter(e.target.value)}
                        className="bg-[#08080A] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/80 focus:outline-none"
                      >
                        <option value="all">All Statuses</option>
                        <option value="available">Available Now</option>
                        <option value="open_to_explore">Open to Explore</option>
                        <option value="occupied">Occupied</option>
                      </select>
                    </div>

                    <span className="text-xs text-white/40 ml-auto">
                      Found {exploreCandidates.length} companions
                    </span>
                  </div>
                </div>

                {exploreCandidates.length === 0 ? (
                  <div className="p-10 rounded-2xl bg-white/5 border border-white/5 text-center space-y-3">
                    <Search className="w-8 h-8 text-white/30 mx-auto" />
                    <h3 className="font-display text-base font-bold text-white">
                      No matching candidates found
                    </h3>
                    <p className="text-xs text-white/40">
                      Try adjusting your keywords or clearing the role/availability filters.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {exploreCandidates.map(({ candidate, matchScore, matchBreakdown, bestRole }) => {
                      const isInvited = invitedCandidateIds[candidate.id];

                      return (
                        <div
                          key={candidate.id}
                          className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all"
                        >
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            
                            <div className="flex items-start gap-3.5 flex-1">
                              <div className="relative shrink-0 mt-0.5">
                                <img
                                  src={candidate.avatar}
                                  alt={candidate.name}
                                  className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                                />
                                <StatusDot
                                  status={candidate.availability}
                                  size="md"
                                  className="absolute -bottom-1 -right-1"
                                />
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    onClick={() => onViewCandidate(candidate)}
                                    className="font-display font-bold text-base text-white hover:text-[#14b8a6] cursor-pointer"
                                  >
                                    {candidate.name}
                                  </span>
                                  <span className="text-xs text-white/50">
                                    • {candidate.primaryRole}
                                  </span>
                                </div>

                                <div className="text-xs text-white/50">
                                  {candidate.headline}
                                </div>

                                <div className="flex items-center gap-2 pt-1 text-[11px] text-white/40">
                                  <span className="text-[#14b8a6] font-bold">
                                    {candidate.experienceLevel} Tier
                                  </span>
                                  <span>•</span>
                                  <span>{candidate.hoursPerWeek} hrs/week</span>
                                  <span>•</span>
                                  <span>{candidate.location}</span>
                                </div>
                              </div>
                            </div>

                            {/* Match Gauge against active project */}
                            <div className="shrink-0 flex sm:flex-col items-center gap-2 self-center sm:self-start">
                              <MatchGauge score={matchScore} size="md" />
                            </div>

                          </div>

                          {/* Candidate Skills */}
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {candidate.skills.map((sk) => {
                              const isReq = activeProject?.requiredSkills.some(
                                (rs) => rs.toLowerCase() === sk.name.toLowerCase()
                              );
                              return (
                                <span
                                  key={sk.name}
                                  className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${
                                    isReq
                                      ? 'bg-[#14b8a6]/10 text-[#14b8a6] border-[#14b8a6]/30 font-bold'
                                      : 'bg-white/5 text-white/40 border-white/5'
                                  }`}
                                >
                                  {isReq && '✓ '}
                                  {sk.name}
                                </span>
                              );
                            })}
                          </div>

                          {/* Actions */}
                          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-3">
                            <button
                              onClick={() => onViewCandidate(candidate)}
                              className="text-xs text-white/60 hover:text-white flex items-center gap-1.5 font-medium cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#14b8a6]" />
                              <span>View Profile</span>
                            </button>

                            {isInvited ? (
                              <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5" /> Invitation Sent
                              </span>
                            ) : (
                              <button
                                onClick={() => handleOpenInvite(candidate)}
                                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                              >
                                <UserPlus className="w-3.5 h-3.5 text-white" />
                                <span>Invite to {activeProject?.title}</span>
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: INVITATIONS & DOUBTS */}
            {activeTab === 'invitations' && (
              <div className="space-y-4">
                
                {projectInvitations.length === 0 ? (
                  <div className="p-12 rounded-2xl bg-white/5 border border-white/5 text-center space-y-3">
                    <Mail className="w-8 h-8 text-white/30 mx-auto" />
                    <h3 className="font-display text-base font-bold text-white">
                      No invitations sent for this project yet
                    </h3>
                    <p className="text-xs text-white/40 max-w-sm mx-auto">
                      Use the <strong>Auto-Recommended</strong> or <strong>Explore Candidates</strong> tabs to invite top-matching companions directly to your squad.
                    </p>
                    <button
                      onClick={() => setActiveTab('recommended')}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] text-white text-xs font-bold shadow-md cursor-pointer"
                    >
                      Browse Recommended Talent
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projectInvitations.map((inv) => {
                      const candidate = inv.candidate;
                      const isChatOpen = activeOwnerChatInviteId === inv.id;
                      const hasMessages = inv.messages && inv.messages.length > 0;

                      return (
                        <div
                          key={inv.id}
                          className={`p-5 rounded-2xl border transition-all ${
                            inv.status === 'accepted'
                              ? 'bg-emerald-500/5 border-emerald-500/30'
                              : inv.status === 'saved_for_later'
                              ? 'bg-amber-500/5 border-amber-500/30'
                              : inv.status === 'rejected'
                              ? 'bg-rose-950/10 border-rose-900/30 opacity-60'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            
                            {/* Candidate Info */}
                            <div className="flex items-start gap-3.5 flex-1">
                              <div className="relative shrink-0">
                                <img
                                  src={candidate.avatar}
                                  alt={candidate.name}
                                  className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                                />
                                <StatusDot
                                  status={candidate.availability}
                                  size="md"
                                  className="absolute -bottom-1 -right-1"
                                />
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 
                                    onClick={() => onViewCandidate(candidate)}
                                    className="font-display font-bold text-sm text-white hover:text-[#14b8a6] cursor-pointer transition-colors"
                                  >
                                    {candidate.name}
                                  </h4>
                                  <span className="text-[10px] text-white/40">• {inv.createdAt}</span>
                                </div>

                                <div className="text-xs text-white/70">
                                  Offered Role: <strong className="text-[#14b8a6] font-bold">{inv.roleTitle}</strong>
                                </div>

                                {candidate.headline && (
                                  <div className="text-xs text-white/40">
                                    {candidate.headline}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Match & Status Badge */}
                            <div className="shrink-0 flex items-center sm:flex-col gap-2 items-end">
                              <div className="flex items-center gap-2">
                                <MatchGauge score={inv.matchScore} size="sm" />
                                <div className="text-right sm:hidden">
                                  <span className="text-xs font-bold text-white">{inv.matchScore}%</span>
                                </div>
                              </div>

                              <div>
                                {inv.status === 'pending' && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                    ● Pending Response
                                  </span>
                                )}
                                {inv.status === 'saved_for_later' && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1">
                                    <BookmarkCheck className="w-3 h-3 text-amber-400" /> Saved by Candidate
                                  </span>
                                )}
                                {inv.status === 'accepted' && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                                    ✓ Accepted to Squad
                                  </span>
                                )}
                                {inv.status === 'rejected' && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                                    ✕ Declined
                                  </span>
                                )}
                              </div>
                            </div>

                          </div>

                          {/* Initial Note */}
                          {inv.initialNote && (
                            <div className="mt-3 p-3 rounded-xl bg-[#08080A] border border-white/5 text-xs text-white/70">
                              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-0.5">Your Invitation Note:</span>
                              "{inv.initialNote}"
                            </div>
                          )}

                          {/* Chat & Profile Buttons */}
                          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-2">
                            <button
                              onClick={() => onViewCandidate(candidate)}
                              className="text-xs text-white/60 hover:text-white flex items-center gap-1.5 font-medium cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#14b8a6]" />
                              <span>View Candidate Profile</span>
                            </button>

                            <button
                              onClick={() => setActiveOwnerChatInviteId(isChatOpen ? null : inv.id)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isChatOpen
                                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                  : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                              }`}
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                              <span>{isChatOpen ? 'Close Discussion' : 'Candidate Doubts / Q&A'}</span>
                              {hasMessages && (
                                <span className="px-1.5 py-0.2 rounded-full bg-sky-500/30 text-sky-200 text-[10px] font-bold">
                                  {inv.messages.length}
                                </span>
                              )}
                            </button>
                          </div>

                          {/* Interactive Discussion Drawer in Owner View */}
                          {isChatOpen && (
                            <div className="mt-3 pt-3 border-t border-white/10 bg-[#08080A] p-4 rounded-xl space-y-3">
                              <div className="flex items-center justify-between text-xs pb-1 border-b border-white/5">
                                <span className="font-bold text-white flex items-center gap-1.5">
                                  <MessageSquare className="w-3.5 h-3.5 text-sky-400" /> Discussion with {candidate.name}
                                </span>
                                <span className="text-[10px] text-white/40">
                                  Answer questions to finalize recruitment
                                </span>
                              </div>

                              {/* Message list */}
                              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                                {inv.messages && inv.messages.length > 0 ? (
                                  inv.messages.map((m) => {
                                    const isMe = m.senderId === currentUser.id || m.isOwner;
                                    return (
                                      <div
                                        key={m.id}
                                        className={`flex items-start gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                                      >
                                        {!isMe && (
                                          <img
                                            src={m.senderAvatar || candidate.avatar}
                                            alt={m.senderName}
                                            className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 border border-white/10"
                                          />
                                        )}
                                        <div
                                          className={`p-2.5 rounded-2xl text-xs max-w-sm ${
                                            isMe
                                              ? 'bg-gradient-to-r from-[#6366f1] to-[#14b8a6] text-white rounded-tr-sm'
                                              : 'bg-white/10 text-white/90 border border-white/10 rounded-tl-sm'
                                          }`}
                                        >
                                          <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 mb-0.5">
                                            <span className="font-bold">{isMe ? 'You (Owner)' : m.senderName}</span>
                                            <span>{m.timestamp}</span>
                                          </div>
                                          <p>{m.text}</p>
                                        </div>
                                        {isMe && (
                                          <img
                                            src={currentUser.avatar}
                                            alt={currentUser.name}
                                            className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 border border-white/10"
                                          />
                                        )}
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="text-center py-4 text-xs text-white/40">
                                    No candidate questions yet.
                                  </div>
                                )}
                              </div>

                              {/* Owner Reply Box */}
                              <form onSubmit={(e) => handleOwnerReplySubmit(e, inv.id)} className="flex items-center gap-2 pt-1">
                                <input
                                  type="text"
                                  value={ownerReplyText}
                                  onChange={(e) => setOwnerReplyText(e.target.value)}
                                  placeholder={`Reply to ${candidate.name.split(' ')[0]}...`}
                                  className="flex-1 py-1.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-sky-500"
                                />
                                <button
                                  type="submit"
                                  disabled={!ownerReplyText.trim()}
                                  className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-black font-bold text-xs cursor-pointer flex items-center gap-1"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Reply</span>
                                </button>
                              </form>

                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      )}

      {/* Invite Candidate Modal */}
      {inviteModalCandidate && activeProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#08080A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-[#14b8a6]" />
                <h3 className="font-display font-bold text-lg text-white">
                  Invite {inviteModalCandidate.name.split(' ')[0]} to Project
                </h3>
              </div>
              <button
                onClick={() => setInviteModalCandidate(null)}
                className="p-1.5 rounded-full text-white/40 hover:text-white bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-white/70 font-semibold block mb-1.5">
                  Project:
                </label>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold">
                  {activeProject.title} ({activeProject.domain})
                </div>
              </div>

              <div>
                <label className="text-white/70 font-semibold block mb-1.5">
                  Target Role:
                </label>
                <select
                  value={inviteSelectedRole}
                  onChange={(e) => setInviteSelectedRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#08080A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#14b8a6]"
                >
                  {activeProject.openRoles.map((r) => (
                    <option key={r.id} value={r.title}>
                      {r.title} ({r.spots - r.filled} spots remaining)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white/70 font-semibold block mb-1.5">
                  Personal Invitation Note:
                </label>
                <textarea
                  rows={3}
                  value={inviteCustomNote}
                  onChange={(e) => setInviteCustomNote(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#08080A] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#14b8a6]"
                  placeholder="Tell them why you'd like them on your team..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setInviteModalCandidate(null)}
                  className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white font-bold shadow-md"
                >
                  Send Invitation
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Confirm Member Removal Dialog */}
      {confirmRemoveMember && activeProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#08080A] border border-rose-500/30 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <UserMinus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  Remove Team Member?
                </h3>
                <p className="text-xs text-white/50">
                  {confirmRemoveMember.name} • {confirmRemoveMember.roleTitle}
                </p>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
              Removing <strong className="text-white">{confirmRemoveMember.name}</strong> will remove them from the squad list for <strong className="text-white">{activeProject.title}</strong> and reopen their open role spot for new applicants.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmRemoveMember(null)}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRemoveTeamMember(activeProject.id, confirmRemoveMember.userId);
                  setConfirmRemoveMember(null);
                }}
                className="px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Removal</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
