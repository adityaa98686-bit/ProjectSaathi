import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Clock, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle,
  ExternalLink,
  ArrowUpRight,
  Crown,
  PauseCircle,
  Lock,
  Hourglass,
  Mail,
  MessageSquare,
  Users,
  Briefcase,
  Compass,
  Eye,
  XCircle,
  Check,
  Github,
  Calendar,
  ShieldCheck,
  Zap,
  TrendingUp,
  FolderGit2,
  HandHeart
} from 'lucide-react';
import { UserProfile, Project, Application, AvailabilityStatus, ProjectInvitation } from '../types';
import { MatchGauge } from './MatchGauge';
import { StatusDot } from './StatusDot';
import { CompletenessBar } from './CompletenessBar';
import { MatchScoreInfoButton } from './MatchScoreInfoButton';
import { MatchScoreExplainerModal } from './MatchScoreExplainerModal';
import { ThemeToggle } from './ThemeToggle';
import { computeMatchScore } from '../utils/matchingEngine';

interface ContributorDashboardProps {
  currentUser: UserProfile;
  projects?: Project[];
  applications?: Application[];
  invitations?: ProjectInvitation[];
  onSelectProject: (project: Project) => void;
  onOpenApplyModal: (project: Project) => void;
  onOpenProfile: () => void;
  onOpenEditProfile: () => void;
  onOpenInvitations?: () => void;
  onUpdateAvailability: (status: AvailabilityStatus) => void;
  onSwitchToOwnerMode?: () => void;
  onWithdrawApplication?: (applicationId: string) => void;
}

export type ContributorTab = 'working' | 'applied' | 'discover';

export const ContributorDashboard: React.FC<ContributorDashboardProps> = ({
  currentUser,
  projects = [],
  applications = [],
  invitations = [],
  onSelectProject,
  onOpenApplyModal,
  onOpenProfile,
  onOpenEditProfile,
  onOpenInvitations,
  onUpdateAvailability,
  onSwitchToOwnerMode,
  onWithdrawApplication,
}) => {
  // Main view differentiator tab: 'working' | 'applied' | 'discover'
  const [activeTab, setActiveTab] = useState<ContributorTab>('discover');

  // Discover tab filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'match' | 'recent' | 'hours'>('match');

  // Applied tab filter state
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<'all' | 'pending' | 'viewed' | 'accepted' | 'waitlisted' | 'declined'>('all');

  const safeProjects = useMemo(() => projects || [], [projects]);
  const safeApplications = useMemo(() => applications || [], [applications]);
  const safeInvitations = useMemo(() => invitations || [], [invitations]);

  // 1. Projects the user is CURRENTLY WORKING ON (Active Squad Memberships)
  const workingOnProjects = useMemo(() => {
    return safeProjects.filter((project) => {
      // Is current user in project.team?
      const inTeam = project.team && project.team.some((m) => m.userId === currentUser.id);
      // Or has an accepted application?
      const hasAcceptedApp = safeApplications.some(
        (app) => app.projectId === project.id && app.applicantId === currentUser.id && app.status === 'accepted'
      );
      return inTeam || hasAcceptedApp;
    });
  }, [safeProjects, safeApplications, currentUser.id]);

  // 2. Projects the user has APPLIED FOR (and their real-time application statuses)
  const myApplications = useMemo(() => {
    return safeApplications.filter((app) => app.applicantId === currentUser.id);
  }, [safeApplications, currentUser.id]);

  const filteredApplications = useMemo(() => {
    return myApplications.filter((app) => {
      if (appliedStatusFilter === 'all') return true;
      if (appliedStatusFilter === 'pending') return app.status === 'pending';
      if (appliedStatusFilter === 'viewed') return app.status === 'viewed';
      if (appliedStatusFilter === 'accepted') return app.status === 'accepted';
      if (appliedStatusFilter === 'waitlisted') return app.status === 'waitlisted';
      if (appliedStatusFilter === 'declined') return app.status === 'declined';
      return true;
    });
  }, [myApplications, appliedStatusFilter]);

  // 3. Compute live match scores for all discoverable projects
  const scoredProjects = useMemo(() => {
    return safeProjects.map((project) => {
      const matchBreakdown = computeMatchScore(currentUser, project);
      const existingApp = safeApplications.find(
        (app) => app.projectId === project.id && app.applicantId === currentUser.id
      );
      const isOwner = project.ownerId === currentUser.id || 
        project.owner?.id === currentUser.id ||
        (typeof project.owner === 'string' && project.owner.toLowerCase() === currentUser.name.toLowerCase()) ||
        (project.owner?.email && project.owner.email.toLowerCase() === currentUser.email?.toLowerCase());
      const isWorkingOn = (project.team && project.team.some((m) => m.userId === currentUser.id)) || existingApp?.status === 'accepted';

      return {
        ...project,
        matchScore: matchBreakdown.overallScore,
        matchBreakdown,
        existingApp,
        isWorkingOn,
        isOwner,
      };
    });
  }, [safeProjects, currentUser, safeApplications]);

  // Projects strictly available for new applications (EXCLUDES own projects, already applied projects, and already joined squads)
  const availableOpenProjects = useMemo(() => {
    return scoredProjects.filter((p) => !p.isOwner && !p.isWorkingOn && !p.existingApp);
  }, [scoredProjects]);

  // Filter & Sort for Discover feed (ONLY shows open projects you can apply to)
  const discoverProjects = useMemo(() => {
    return availableOpenProjects
      .filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.domain.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDomain = selectedDomain === 'all' || p.domain === selectedDomain;
        const matchesType = selectedType === 'all' || p.projectType === selectedType;
        const matchesScore = p.matchScore >= minScore;

        return matchesSearch && matchesDomain && matchesType && matchesScore;
      })
      .sort((a, b) => {
        if (sortBy === 'match') return b.matchScore - a.matchScore;
        if (sortBy === 'hours') return a.commitmentHours - b.commitmentHours;
        return 0; // default order
      });
  }, [availableOpenProjects, searchQuery, selectedDomain, selectedType, minScore, sortBy]);

  // Unique domains and types
  const domains = Array.from(new Set(safeProjects.map((p) => p.domain)));
  const types = Array.from(new Set(safeProjects.map((p) => p.projectType)));

  // Direct Invitations
  const myInvitations = useMemo(() => {
    return safeInvitations.filter((inv) => inv.candidateId === currentUser.id);
  }, [safeInvitations, currentUser.id]);

  const pendingInvites = useMemo(() => {
    return myInvitations.filter((inv) => inv.status === 'pending' || inv.status === 'saved_for_later');
  }, [myInvitations]);

  // High match score opportunities (>80%) that are new & available to apply
  const highMatchCount = useMemo(() => {
    return availableOpenProjects.filter((p) => p.matchScore >= 80).length;
  }, [availableOpenProjects]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner with Companion Message & Availability */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-white/10 via-white/5 to-transparent border border-white/5 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-14 h-14 rounded-2xl object-cover border border-[#14b8a6]/40 shadow-lg"
            />
            <StatusDot
              status={currentUser.availability}
              size="md"
              className="absolute -bottom-1 -right-1"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-xl font-bold text-white tracking-tight">
                Welcome back, {currentUser.name.split(' ')[0]}
              </h1>
              <StatusDot
                status={currentUser.availability}
                showLabel
                isInteractive
                onToggle={onUpdateAvailability}
              />
            </div>
            <p className="text-xs text-white/50 mt-1 max-w-xl">
              Role: <span className="text-white font-medium">{currentUser.primaryRole}</span> • Matching{' '}
              <span className="text-[#14b8a6] font-medium">{currentUser.skills.length} skills</span> against{' '}
              <span className="text-[#14b8a6] font-medium">{currentUser.hoursPerWeek}h/wk</span> capacity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {onOpenInvitations && myInvitations.length > 0 && (
            <button
              onClick={onOpenInvitations}
              className="px-4 py-2 rounded-full bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Invitations</span>
              {pendingInvites.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-sky-500 text-black text-[10px] font-extrabold">
                  {pendingInvites.length}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onOpenEditProfile}
            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs font-semibold transition-colors cursor-pointer"
          >
            Edit Profile & Skills
          </button>
          <button
            onClick={onOpenProfile}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            Public Card
          </button>
        </div>
      </div>

      {/* Direct Invitation Callout Banner (if user has invitations) */}
      {onOpenInvitations && pendingInvites.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-500/15 via-[#6366f1]/15 to-[#14b8a6]/15 border border-sky-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glow-accent">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-300 shrink-0">
              <Mail className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm font-bold text-white">
                  You have {pendingInvites.length} direct project invitation{pendingInvites.length > 1 ? 's' : ''} waiting!
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/30 text-sky-200 border border-sky-500/40 text-[10px] font-bold">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-white/70 max-w-2xl">
                Project owners invited you to customized squad positions. You can <strong>Accept</strong>, <strong>Reject</strong>, <strong>Save for later</strong>, or <strong>Chat Doubts</strong> directly.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenInvitations}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-400 to-[#14b8a6] hover:brightness-110 text-black text-xs font-extrabold shadow-lg transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
          >
            <span>Review & Reply ({pendingInvites.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Differentiated Glance Counters (Clickable Shortcuts) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        
        {/* 1. Working On Projects */}
        <button
          onClick={() => setActiveTab('working')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'working'
              ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg glow-accent'
              : 'bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/[0.07]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
              Active Squads
            </span>
            <div className={`p-1.5 rounded-lg ${activeTab === 'working' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-white/40'}`}>
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-white">
              {workingOnProjects.length}
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold">
              Working On
            </span>
          </div>
        </button>

        {/* 2. Applied Projects Status */}
        <button
          onClick={() => setActiveTab('applied')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'applied'
              ? 'bg-amber-500/10 border-amber-500/40 shadow-lg glow-accent'
              : 'bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/[0.07]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
              Applications
            </span>
            <div className={`p-1.5 rounded-lg ${activeTab === 'applied' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-white/40'}`}>
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-white">
              {myApplications.length}
            </span>
            <span className="text-[11px] text-amber-400 font-semibold">
              In Review / Status
            </span>
          </div>
        </button>

        {/* 3. High Match Opportunities */}
        <button
          onClick={() => {
            setActiveTab('discover');
            setMinScore(80);
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'discover' && minScore === 80
              ? 'bg-[#14b8a6]/10 border-[#14b8a6]/40 shadow-lg glow-accent'
              : 'bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/[0.07]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
              High Match (80%+)
            </span>
            <div className="p-1.5 rounded-lg bg-[#14b8a6]/20 text-[#14b8a6]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-white">
              {highMatchCount}
            </span>
            <span className="text-[11px] text-[#14b8a6] font-semibold">
              Top Compatibility
            </span>
          </div>
        </button>

        {/* 4. Discover All Projects */}
        <button
          onClick={() => {
            setActiveTab('discover');
            setMinScore(0);
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'discover' && minScore === 0
              ? 'bg-[#6366f1]/10 border-[#6366f1]/40 shadow-lg glow-accent'
              : 'bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/[0.07]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
              Open to Apply
            </span>
            <div className="p-1.5 rounded-lg bg-[#6366f1]/20 text-indigo-300">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-white">
              {availableOpenProjects.length}
            </span>
            <span className="text-[11px] text-indigo-400 font-semibold">
              Want to Contribute
            </span>
          </div>
        </button>

      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Profile Summary & Completeness Meter */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Profile Completeness Nudge */}
          <CompletenessBar user={currentUser} onActionClick={onOpenEditProfile} />

          {/* Quick Contributor Overview Card */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                Your Match Profile
              </span>
              <div className="flex items-center gap-2">
                <MatchScoreInfoButton
                  size="xs"
                  variant="circle"
                />
                <button
                  onClick={onOpenEditProfile}
                  className="text-xs text-[#14b8a6] hover:underline font-medium cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs text-white/70">
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-white/40">Primary Role</span>
                <span className="font-semibold text-white">{currentUser.primaryRole}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-white/40">Experience Tier</span>
                <span className="font-bold text-[#14b8a6] bg-[#14b8a6]/10 px-2 py-0.5 rounded-full border border-[#14b8a6]/20 text-[11px]">
                  {currentUser.experienceLevel}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-white/40">Weekly Commitment</span>
                <span className="font-semibold text-white">{currentUser.hoursPerWeek} hrs/week</span>
              </div>

              {currentUser.isLinkedinVerified && (
                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/40">Verification</span>
                  <span className="text-sky-400 font-medium inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> LinkedIn Verified
                  </span>
                </div>
              )}
            </div>

            {/* Tagged Skills */}
            <div className="mt-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
                Active Skills ({currentUser.skills.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentUser.skills.map((skill) => (
                  <span
                    key={skill.name}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium border ${
                      skill.category === 'technical'
                        ? 'bg-[#6366f1]/10 text-indigo-300 border-[#6366f1]/30'
                        : skill.category === 'design'
                        ? 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30'
                        : 'bg-white/5 text-white/60 border-white/10'
                    }`}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Tagged Interests */}
            <div className="mt-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
                Domain Interests
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentUser.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-2.5 py-0.5 rounded-full bg-[#14b8a6]/10 text-[#14b8a6] text-[11px] border border-[#14b8a6]/20 font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Squad & Applications Shortcuts */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                Quick Navigation
              </span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('working')}
                className={`w-full p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'working'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                    : 'bg-[#08080A] border-white/5 text-white/70 hover:text-white hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <span>Projects I'm Working On</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                  {workingOnProjects.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('applied')}
                className={`w-full p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'applied'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold'
                    : 'bg-[#08080A] border-white/5 text-white/70 hover:text-white hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Projects Applied For (Status)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                  {myApplications.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('discover')}
                className={`w-full p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'discover'
                    ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 font-bold'
                    : 'bg-[#08080A] border-white/5 text-white/70 hover:text-white hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  <span>Open Projects to Contribute</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">
                  {availableOpenProjects.length}
                </span>
              </button>
            </div>
          </div>

          {/* Theme Preference Widget */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
            <span className="text-xs font-semibold text-white/70">Display Mode</span>
            <ThemeToggle variant="switch" />
          </div>

        </div>

        {/* Right Main Feed: Distinct Differentiated Tabs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Segmented Header Tabs */}
          <div className="p-1.5 rounded-2xl bg-[#08080A] border border-white/10 flex flex-col sm:flex-row items-stretch gap-1 shadow-xl">
            
            {/* Tab 1: Working On */}
            <button
              onClick={() => setActiveTab('working')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'working'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Projects I'm Working On</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'working' ? 'bg-black/30 text-white' : 'bg-white/10 text-white/70'
              }`}>
                {workingOnProjects.length}
              </span>
            </button>

            {/* Tab 2: Applied Projects Status */}
            <button
              onClick={() => setActiveTab('applied')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'applied'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Projects Applied For</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'applied' ? 'bg-black/30 text-white' : 'bg-white/10 text-white/70'
              }`}>
                {myApplications.length}
              </span>
            </button>

            {/* Tab 3: Discover & Contribute */}
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'discover'
                  ? 'bg-gradient-to-r from-[#6366f1] to-[#14b8a6] text-white shadow-lg shadow-indigo-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore & Contribute</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'discover' ? 'bg-black/30 text-white' : 'bg-white/10 text-white/70'
              }`}>
                {availableOpenProjects.length}
              </span>
            </button>

          </div>

          {/* ========================================================================= */}
          {/* VIEW 1: PROJECTS I AM WORKING ON (Active Squads)                          */}
          {/* ========================================================================= */}
          {activeTab === 'working' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Active Squad Workspaces
                  </h2>
                  <p className="text-xs text-white/60 mt-0.5">
                    Projects where you are a confirmed team member. Collaborate with your squad, track sprint milestones, and view teammates.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold">
                  {workingOnProjects.length} Active
                </span>
              </div>

              {workingOnProjects.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white/5 border border-white/5 space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 w-14 h-14 mx-auto flex items-center justify-center text-white/40">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display text-base font-bold text-white">
                      You haven't joined an active squad yet
                    </h3>
                    <p className="text-xs text-white/50 max-w-md mx-auto leading-relaxed">
                      Explore open project openings matched to your skills, or check your pending applications and invitations to join a team.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setActiveTab('discover')}
                      className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white text-xs font-bold shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Explore Open Projects</span>
                    </button>
                    {pendingInvites.length > 0 && onOpenInvitations && (
                      <button
                        onClick={onOpenInvitations}
                        className="px-4 py-2.5 rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Accept Invitations ({pendingInvites.length})</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {workingOnProjects.map((project) => {
                    const myTeamEntry = project.team.find((m) => m.userId === currentUser.id);
                    const myRoleTitle = myTeamEntry?.roleTitle || 'Core Squad Contributor';

                    return (
                      <div
                        key={project.id}
                        className="p-6 rounded-3xl bg-white/5 border border-emerald-500/30 border-l-4 border-l-emerald-500 shadow-xl space-y-4 hover:border-emerald-500/50 transition-all"
                      >
                        {/* Header & Role */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1">
                                <Check className="w-3 h-3 stroke-[3]" /> Active Squad Member
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-[11px] font-medium">
                                {project.projectType}
                              </span>
                              <span className="text-white/40 text-xs">{project.domain}</span>
                              {project.deadline && (
                                <span className="text-amber-400 text-xs flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {project.deadline}
                                </span>
                              )}
                            </div>

                            <h3
                              onClick={() => onSelectProject(project)}
                              className="font-display text-xl font-bold text-white hover:text-emerald-400 cursor-pointer transition-colors"
                            >
                              {project.title}
                            </h3>
                            <p className="text-xs text-white/60 leading-relaxed max-w-2xl">
                              {project.tagline}
                            </p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-[#08080A] border border-white/10 text-right sm:min-w-[180px] shrink-0">
                            <span className="text-[10px] uppercase tracking-wider text-white/40 block font-bold">
                              Your Assigned Role
                            </span>
                            <span className="text-xs font-bold text-emerald-300 block mt-0.5">
                              {myRoleTitle}
                            </span>
                            <span className="text-[10px] text-white/40 mt-1 block">
                              Joined {myTeamEntry?.joinedAt || 'Recently'}
                            </span>
                          </div>
                        </div>

                        {/* Squad Teammates Gallery */}
                        <div className="p-4 rounded-2xl bg-[#08080A] border border-white/5 space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-emerald-400" /> Squad Roster ({project.team.length + 1} / {project.maxTeamSize} Builders)
                            </span>
                            <span className="text-[11px] text-emerald-400 font-semibold">
                              {project.commitmentHours}h weekly sprint
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                            {/* Project Owner */}
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
                              <div className="relative shrink-0">
                                <img
                                  src={project.owner.avatar}
                                  alt={project.owner.name}
                                  className="w-8 h-8 rounded-full object-cover border border-amber-500/40"
                                />
                                <Crown className="w-3 h-3 text-amber-400 absolute -top-1 -right-1" />
                              </div>
                              <div className="truncate">
                                <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                                  {project.owner.name}
                                </div>
                                <div className="text-[10px] text-amber-300/80 truncate">
                                  Lead / Creator
                                </div>
                              </div>
                            </div>

                            {/* Team Members */}
                            {project.team.map((member) => (
                              <div
                                key={member.userId}
                                className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                                  member.userId === currentUser.id
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : 'bg-white/5 border-white/5'
                                }`}
                              >
                                <div className="relative shrink-0">
                                  <img
                                    src={member.user.avatar}
                                    alt={member.user.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                  <StatusDot
                                    status={member.user.availability}
                                    size="sm"
                                    className="absolute -bottom-0.5 -right-0.5"
                                  />
                                </div>
                                <div className="truncate">
                                  <div className="text-xs font-bold text-white truncate">
                                    {member.user.name} {member.userId === currentUser.id && '(You)'}
                                  </div>
                                  <div className="text-[10px] text-white/50 truncate">
                                    {member.roleTitle}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions & Links */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            {project.githubRepo && (
                              <a
                                href={project.githubRepo}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                              >
                                <Github className="w-3.5 h-3.5" />
                                <span>Code Repository</span>
                                <ExternalLink className="w-3 h-3 text-white/30" />
                              </a>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onSelectProject(project)}
                              className="px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                            >
                              <span>Squad Workspace & Details</span>
                              <ArrowUpRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: PROJECTS APPLIED FOR (Application Tracker & Real-Time Status)      */}
          {/* ========================================================================= */}
          {activeTab === 'applied' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Application Filter Bar */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400" /> Submitted Applications ({myApplications.length})
                    </h2>
                    <p className="text-xs text-white/50 mt-0.5">
                      Track the status of your applications as project creators review your profile and match scores.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(['all', 'pending', 'viewed', 'accepted', 'waitlisted', 'declined'] as const).map((statusKey) => {
                      const count = statusKey === 'all' 
                        ? myApplications.length 
                        : myApplications.filter((a) => a.status === statusKey).length;
                      
                      if (count === 0 && statusKey !== 'all' && statusKey !== 'pending') return null;

                      return (
                        <button
                          key={statusKey}
                          onClick={() => setAppliedStatusFilter(statusKey)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                            appliedStatusFilter === statusKey
                              ? 'bg-amber-500 text-black font-bold'
                              : 'bg-white/5 text-white/60 hover:text-white border border-white/5'
                          }`}
                        >
                          {statusKey === 'all' ? 'All' : statusKey} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {filteredApplications.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white/5 border border-white/5 space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 w-14 h-14 mx-auto flex items-center justify-center text-white/40">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display text-base font-bold text-white">
                      No applications in this category
                    </h3>
                    <p className="text-xs text-white/50 max-w-md mx-auto leading-relaxed">
                      {appliedStatusFilter === 'all'
                        ? "You haven't submitted any applications yet. Explore projects on the Discover tab to find your match!"
                        : `You have no applications with "${appliedStatusFilter}" status.`}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('discover')}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white text-xs font-bold shadow-lg transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Search Projects to Apply</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((app) => {
                    const project = safeProjects.find((p) => p.id === app.projectId);
                    const matchScore = app.matchScore || app.matchBreakdown?.overallScore || 85;

                    return (
                      <div
                        key={app.id}
                        className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-4 shadow-xl"
                      >
                        {/* Top: Project Info, Role & Status Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              <span className="text-white/40 text-[11px] uppercase tracking-wider font-bold">
                                {app.projectDomain}
                              </span>
                              <span className="text-white/20">•</span>
                              <span className="text-white/50 text-xs">
                                Applied {app.appliedAt}
                              </span>
                            </div>

                            <h3
                              onClick={() => project && onSelectProject(project)}
                              className="font-display text-lg font-bold text-white hover:text-amber-400 cursor-pointer transition-colors"
                            >
                              {app.projectTitle}
                            </h3>

                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-white/40">Target Role:</span>
                              <span className="font-bold text-[#14b8a6] bg-[#14b8a6]/10 px-2.5 py-0.5 rounded-full border border-[#14b8a6]/20">
                                {app.roleTitle}
                              </span>
                            </div>
                          </div>

                          {/* Status Badge & Gauge */}
                          <div className="flex items-center sm:flex-col sm:items-end gap-3 shrink-0">
                            <span
                              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                                app.status === 'accepted'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                                  : app.status === 'viewed'
                                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                                  : app.status === 'waitlisted'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : app.status === 'declined'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {app.status === 'accepted' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                              {app.status === 'viewed' && <Eye className="w-3.5 h-3.5 text-sky-400" />}
                              {app.status === 'waitlisted' && <Hourglass className="w-3.5 h-3.5 text-amber-400" />}
                              {app.status === 'declined' && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                              {app.status === 'pending' && <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
                              <span>
                                {app.status === 'pending' ? 'Pending Review' : app.status}
                              </span>
                            </span>

                            <div className="text-[11px] text-white/50 flex items-center gap-1">
                              <span>Match fit:</span>
                              <strong className="text-white font-bold">{matchScore}%</strong>
                            </div>
                          </div>
                        </div>

                        {/* Status Progression Stepper */}
                        <div className="p-3.5 rounded-2xl bg-[#08080A] border border-white/5">
                          <div className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2.5">
                            Application Progress
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            {/* Step 1: Submitted */}
                            <div className="p-2 rounded-xl bg-white/5 border border-emerald-500/30 text-emerald-300 flex flex-col items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span className="font-bold text-[11px]">1. Submitted</span>
                              <span className="text-[9px] text-white/40">Profile Sent</span>
                            </div>

                            {/* Step 2: Under Review */}
                            <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                              app.status === 'viewed' || app.status === 'accepted' || app.status === 'waitlisted' || app.status === 'declined'
                                ? 'bg-white/5 border-sky-500/30 text-sky-300'
                                : 'bg-white/[0.02] border-white/5 text-white/40'
                            }`}>
                              {app.status === 'viewed' || app.status === 'accepted' || app.status === 'waitlisted' || app.status === 'declined' ? (
                                <Eye className="w-4 h-4 text-sky-400" />
                              ) : (
                                <Clock className="w-4 h-4 text-white/30" />
                              )}
                              <span className="font-bold text-[11px]">2. Owner Review</span>
                              <span className="text-[9px] text-white/40">
                                {app.status === 'pending' ? 'In Queue' : 'Profile Viewed'}
                              </span>
                            </div>

                            {/* Step 3: Decision */}
                            <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                              app.status === 'accepted'
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                                : app.status === 'waitlisted'
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold'
                                : app.status === 'declined'
                                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 font-bold'
                                : 'bg-white/[0.02] border-white/5 text-white/40'
                            }`}>
                              {app.status === 'accepted' ? (
                                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                              ) : app.status === 'waitlisted' ? (
                                <Hourglass className="w-4 h-4 text-amber-400" />
                              ) : app.status === 'declined' ? (
                                <XCircle className="w-4 h-4 text-rose-400" />
                              ) : (
                                <ShieldCheck className="w-4 h-4 text-white/30" />
                              )}
                              <span className="font-bold text-[11px]">3. Decision</span>
                              <span className="text-[9px] text-white/40">
                                {app.status === 'accepted'
                                  ? 'Joined Squad!'
                                  : app.status === 'waitlisted'
                                  ? 'On Waitlist'
                                  : app.status === 'declined'
                                  ? 'Declined'
                                  : 'Awaiting Decision'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Note Sent */}
                        {app.note && (
                          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/70 space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">
                              Your Application Pitch / Note:
                            </span>
                            <p className="italic text-white/80 leading-relaxed">
                              "{app.note}"
                            </p>
                          </div>
                        )}

                        {/* Bottom Actions */}
                        <div className="pt-1 flex items-center justify-between gap-3 text-xs">
                          {project && (
                            <button
                              onClick={() => onSelectProject(project)}
                              className="text-white/60 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span>View Project Overview</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <div className="flex items-center gap-2 ml-auto">
                            {app.status === 'accepted' && (
                              <button
                                onClick={() => setActiveTab('working')}
                                className="px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Briefcase className="w-3.5 h-3.5" />
                                <span>Go to Active Squad</span>
                              </button>
                            )}

                            {onWithdrawApplication && app.status === 'pending' && (
                              <button
                                onClick={() => onWithdrawApplication(app.id)}
                                className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs transition-all cursor-pointer"
                              >
                                Withdraw
                              </button>
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

          {/* ========================================================================= */}
          {/* VIEW 3: DISCOVER & JOIN PROJECTS (Search, Filter, Compatibility Match)   */}
          {/* ========================================================================= */}
          {activeTab === 'discover' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Search and Filters Bar */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Search input */}
                  <div className="relative w-full">
                    <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by tech stack, project title, domain, or role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#08080A] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#14b8a6]"
                    />
                  </div>

                  {/* Sort by dropdown */}
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <span className="text-xs text-white/40">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-[#08080A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-[#14b8a6] cursor-pointer"
                    >
                      <option value="match">Highest Match %</option>
                      <option value="recent">Most Recent</option>
                      <option value="hours">Hours (Low to High)</option>
                    </select>
                  </div>
                </div>

                {/* Quick Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-xs">
                  <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Domain:</span>
                  <button
                    onClick={() => setSelectedDomain('all')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                      selectedDomain === 'all'
                        ? 'bg-white text-black'
                        : 'bg-white/5 text-white/50 hover:text-white border border-white/5'
                    }`}
                  >
                    All Domains
                  </button>
                  {domains.map((dom) => (
                    <button
                      key={dom}
                      onClick={() => setSelectedDomain(dom)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        selectedDomain === dom
                          ? 'bg-white text-black'
                          : 'bg-white/5 text-white/50 hover:text-white border border-white/5'
                      }`}
                    >
                      {dom}
                    </button>
                  ))}

                  {/* Min score filter */}
                  <div className="ml-auto flex items-center gap-2 flex-wrap">
                    <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Min Match:</span>
                    <select
                      value={minScore}
                      onChange={(e) => setMinScore(Number(e.target.value))}
                      className="bg-[#08080A] border border-white/10 rounded-lg px-2 py-1 text-xs text-[#14b8a6] font-bold focus:outline-none"
                    >
                      <option value="0">All Scores</option>
                      <option value="70">70%+ (High)</option>
                      <option value="85">85%+ (Great)</option>
                    </select>

                    <MatchScoreInfoButton
                      variant="pill"
                      showLabel
                      label="Formula & Parameters"
                      className="hidden sm:inline-flex"
                    />
                  </div>
                </div>
              </div>

              {/* Project List */}
              {discoverProjects.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/5 space-y-3">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 w-12 h-12 mx-auto flex items-center justify-center text-white/40">
                    <HandHeart className="w-6 h-6 text-[#14b8a6]" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-white">
                    {availableOpenProjects.length === 0 
                      ? "You're All Caught Up!" 
                      : "No matching open projects found"}
                  </h3>
                  <p className="text-xs text-white/40 max-w-md mx-auto leading-relaxed">
                    {availableOpenProjects.length === 0 
                      ? "You have already applied for or are actively collaborating on all active project openings! Check your applications tab or active squads tab above." 
                      : "Try widening your search keywords or lowering the match threshold to see more opportunities."}
                  </p>
                  {availableOpenProjects.length > 0 ? (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedDomain('all');
                        setMinScore(0);
                      }}
                      className="mt-2 px-4 py-2 rounded-full bg-white/10 text-[#14b8a6] text-xs font-semibold hover:bg-white/15 transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('applied')}
                      className="mt-2 px-5 py-2 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 border border-amber-500/40 transition-colors cursor-pointer"
                    >
                      View Projects Applied For ({myApplications.length})
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {discoverProjects.map((project) => {
                    const isOwner = project.ownerId === currentUser.id || project.owner?.email?.toLowerCase() === currentUser.email?.toLowerCase();
                    const isPaused = project.recruitmentStatus === 'paused';
                    const isClosed = project.recruitmentStatus === 'closed';
                    const isWorking = project.isWorkingOn;
                    const hasApplied = !!project.existingApp;

                    return (
                      <div
                        key={project.id}
                        className={`p-6 rounded-2xl bg-white/5 border transition-all duration-200 hover:border-white/20 hover:shadow-2xl flex flex-col justify-between ${
                          isWorking
                            ? 'border-emerald-500/30 border-l-4 border-l-emerald-500 bg-emerald-500/[0.02]'
                            : isOwner
                            ? 'border-amber-500/30 border-l-4 border-l-amber-400 bg-amber-500/[0.02]'
                            : hasApplied
                            ? 'border-sky-500/30 border-l-4 border-l-sky-400 bg-sky-500/[0.02]'
                            : project.matchScore >= 80
                            ? 'border-white/10 border-l-4 border-l-[#14b8a6]'
                            : 'border-white/5'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
                          
                          {/* Left: Project Information */}
                          <div className="space-y-2.5 flex-1">
                            
                            {/* Top Badges */}
                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              <span className="px-2.5 py-0.5 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 text-[#14b8a6] font-bold text-[11px]">
                                {project.projectType}
                              </span>
                              <span className="text-white/60 text-xs">
                                {project.domain}
                              </span>
                              <span className="text-white/20">•</span>
                              <span className="text-white/60 text-xs">
                                {project.difficulty} Level
                              </span>

                              {isWorking && (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                                  <Check className="w-3 h-3" /> In Your Squad
                                </span>
                              )}

                              {isOwner && !isWorking && (
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                                  <Crown className="w-3 h-3 text-amber-400" /> Your Project (Owner)
                                </span>
                              )}

                              {hasApplied && !isWorking && (
                                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-[11px] font-bold flex items-center gap-1">
                                  <FileText className="w-3 h-3" /> Application: {project.existingApp?.status}
                                </span>
                              )}

                              {isPaused && (
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium flex items-center gap-1">
                                  <PauseCircle className="w-3 h-3 text-amber-400" /> Paused
                                </span>
                              )}

                              {isClosed && (
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] font-medium flex items-center gap-1">
                                  <Lock className="w-3 h-3 text-rose-400" /> Squad Full
                                </span>
                              )}

                              {project.deadline && (
                                <>
                                  <span className="text-white/20">•</span>
                                  <span className="text-amber-400 text-xs flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {project.deadline}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Title & Tagline */}
                            <div>
                              <h2
                                onClick={() => onSelectProject(project)}
                                className="font-display text-xl font-bold text-white hover:text-[#14b8a6] cursor-pointer transition-colors"
                              >
                                {project.title}
                              </h2>
                              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                                {project.tagline}
                              </p>
                            </div>

                            {/* Required vs Matched Skills */}
                            <div className="pt-2">
                              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1.5">
                                Required Stack
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {project.requiredSkills.map((skill) => {
                                  const isUserSkill = project.matchBreakdown.matchedSkills.includes(skill);
                                  return (
                                    <span
                                      key={skill}
                                      className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                                        isUserSkill
                                          ? 'bg-[#14b8a6]/10 text-[#14b8a6] border-[#14b8a6]/30 shadow-[0_0_10px_rgba(20,184,166,0.15)]'
                                          : 'bg-white/5 text-white/40 border-white/5'
                                      }`}
                                    >
                                      {isUserSkill && <span className="text-[#14b8a6] font-bold mr-1">✓</span>}
                                      {skill}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Plain-English Match Synthesis */}
                            <div className="mt-3 p-3 rounded-xl bg-[#08080A] border border-white/5 text-xs text-white/70 leading-relaxed">
                              <div className="flex items-center justify-between mb-0.5">
                                <div className="font-bold text-[#14b8a6] text-[11px] flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> Match Synthesis:
                                </div>
                                <MatchScoreInfoButton
                                  score={project.matchScore}
                                  breakdown={project.matchBreakdown}
                                  variant="link"
                                  label="Why this %?"
                                />
                              </div>
                              {project.matchBreakdown.explanation}
                            </div>

                          </div>

                          {/* Right: Signature Animated Match Gauge & Apply Action */}
                          <div className="sm:w-48 shrink-0 flex flex-col items-center justify-between p-4 rounded-2xl bg-[#08080A] border border-white/5 text-center self-stretch">
                            <div>
                              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
                                <span>Compatibility</span>
                                <MatchScoreInfoButton
                                  score={project.matchScore}
                                  breakdown={project.matchBreakdown}
                                  size="xs"
                                />
                              </div>
                              <MatchGauge score={project.matchScore} size="lg" />
                            </div>

                            <div className="w-full mt-4 space-y-2">
                              {isWorking ? (
                                <button
                                  onClick={() => setActiveTab('working')}
                                  className="w-full py-2 px-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <Briefcase className="w-3.5 h-3.5" />
                                  <span>In Your Squad</span>
                                </button>
                              ) : isOwner ? (
                                <button
                                  onClick={() => {
                                    if (onSwitchToOwnerMode) {
                                      onSwitchToOwnerMode();
                                    } else {
                                      onSelectProject(project);
                                    }
                                  }}
                                  className="w-full py-2 px-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <Crown className="w-3.5 h-3.5" />
                                  <span>Manage Project</span>
                                </button>
                              ) : hasApplied ? (
                                <button
                                  onClick={() => setActiveTab('applied')}
                                  className="w-full py-2 px-3 rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>View Applied ({project.existingApp?.status})</span>
                                </button>
                              ) : isPaused ? (
                                <div className="w-full py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                                  <span className="text-xs font-bold text-amber-300">
                                    ⏸️ Paused
                                  </span>
                                </div>
                              ) : isClosed ? (
                                <div className="w-full py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                                  <span className="text-xs font-bold text-rose-300">
                                    🔒 Squad Full
                                  </span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => onOpenApplyModal(project)}
                                  className="w-full py-2 px-3 rounded-full bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white font-bold text-xs shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                  <HandHeart className="w-3.5 h-3.5" />
                                  <span>Want to Contribute</span>
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => onSelectProject(project)}
                                className="w-full py-1.5 text-xs text-white/40 hover:text-white transition-colors cursor-pointer block"
                              >
                                View Details →
                              </button>
                            </div>

                          </div>

                        </div>

                        {/* Card Bottom Meta */}
                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <img
                                src={project.owner.avatar}
                                alt={project.owner.name}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <StatusDot
                                status={project.owner.availability}
                                size="sm"
                                className="absolute -bottom-0.5 -right-0.5"
                              />
                            </div>
                            <span className="text-white/60 text-xs">
                              {isOwner ? (
                                <strong className="text-amber-300 font-bold">Created by you</strong>
                              ) : (
                                <>Posted by <strong className="text-white font-medium">{project.owner.name}</strong></>
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span>{project.openRoles.length} Open Roles</span>
                            <span className="text-white/20">•</span>
                            <span>{project.commitmentHours} hrs/week</span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
