import React, { useState } from 'react';
import { 
  Compass, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Users,
  Cpu,
  Target,
  FileCheck,
  UserPlus,
  LogIn,
  Play,
  HelpCircle,
  Calculator,
  Percent,
  TrendingUp,
  Clock,
  Briefcase
} from 'lucide-react';
import { Logo } from './Logo';
import { MatchGauge } from './MatchGauge';
import { StatusDot } from './StatusDot';
import { SkillGapRadar } from './SkillGapRadar';
import { MatchScoreExplainerModal } from './MatchScoreExplainerModal';
import { MatchScoreInfoButton } from './MatchScoreInfoButton';
import { ThemeToggle } from './ThemeToggle';
import { Project, UserProfile } from '../types';

interface LandingViewProps {
  onStartBuilding: () => void;
  onStartJoining: () => void;
  onOpenAuth: (tab?: 'register' | 'login' | 'demo') => void;
  featuredProjects: Project[];
  onSelectProject: (project: Project) => void;
  onViewCandidate: (user: UserProfile) => void;
  candidates: UserProfile[];
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStartBuilding,
  onStartJoining,
  onOpenAuth,
  featuredProjects,
  onSelectProject,
  onViewCandidate,
  candidates,
}) => {
  // Interactive mini playground state
  const [interactiveSkill, setInteractiveSkill] = useState<'high' | 'mid' | 'low'>('high');
  const [interactiveAvail, setInteractiveAvail] = useState<'available' | 'open_to_explore' | 'occupied'>('available');
  const [interactiveExp, setInteractiveExp] = useState<'match' | 'junior'>('match');
  const [isExplainerOpen, setIsExplainerOpen] = useState<boolean>(false);

  const demoScore = Math.round(
    (interactiveSkill === 'high' ? 95 : interactiveSkill === 'mid' ? 70 : 40) * 0.40 +
    (interactiveAvail === 'available' ? 100 : interactiveAvail === 'open_to_explore' ? 75 : 25) * 0.15 +
    (interactiveExp === 'match' ? 95 : 70) * 0.35 +
    90 * 0.10
  );

  return (
    <div className="min-h-screen bg-[#08080A] text-white flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-14 pb-20 border-b border-white/5">
        {/* Ambient subtle glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-[#6366f1]/20 via-[#14b8a6]/15 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Saathi Concept Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#14b8a6] text-xs font-semibold mb-6 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#14b8a6] animate-pulse" />
            <span>साथी (Saathi) — someone who journeys with you</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
            Find your <span className="bg-gradient-to-r from-indigo-400 via-[#14b8a6] to-teal-200 bg-clip-text text-transparent">companion</span> for the project journey ahead.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-white/50 max-w-2xl mx-auto font-normal leading-relaxed">
            Replaces "ask your friends" with an actual compatibility engine. Form high-performing teams for hackathons, startups, and research based on skills, verified interests, and real availability.
          </p>

          {/* Direct 3-Option Entry Gateway (Register, Log In, Demo Version) */}
          <div className="mt-8 p-3 max-w-2xl mx-auto rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-2xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2.5">
              Choose how you want to start
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: New Register */}
              <button
                onClick={() => onOpenAuth('register')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#6366f1] to-[#14b8a6] hover:brightness-110 text-white font-bold text-xs shadow-lg glow-accent transition-all transform active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>New Register</span>
              </button>

              {/* Option 2: Already Log In */}
              <button
                onClick={() => onOpenAuth('login')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold text-xs transition-all transform active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#14b8a6]" />
                <span>Already Log In</span>
              </button>

              {/* Option 3: Demo Version */}
              <button
                onClick={() => onOpenAuth('demo')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#6366f1]/15 hover:bg-[#6366f1]/25 border border-[#6366f1]/30 hover:border-[#6366f1]/50 text-indigo-200 font-bold text-xs transition-all transform active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current text-[#14b8a6]" />
                <span>Use Demo Version</span>
              </button>
            </div>
          </div>

          {/* Quick Dual Role Launch Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={onStartBuilding}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-medium text-xs transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Explore Builder Workspace</span>
              <ArrowRight className="w-3 h-3 text-white/40" />
            </button>

            <button
              onClick={onStartJoining}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-medium text-xs transition-all cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#14b8a6]" />
              <span>Browse Open Companion Roles</span>
              <ArrowRight className="w-3 h-3 text-white/40" />
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-white/40">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#14b8a6]" />
              <span>Weighted 5-Factor Match Algorithm</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#14b8a6]" />
              <span>Team Skill Gap Spider Radars</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#14b8a6]" />
              <span>Multi-Dimensional Skill Alignment</span>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Match Engine Interactive Showcase */}
      <section id="compatibility-engine" className="py-16 bg-[#08080A] border-b border-white/5 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14b8a6]/10 border border-[#14b8a6]/20 text-[#14b8a6] text-xs font-bold uppercase tracking-wider mb-3">
              <Percent className="w-3.5 h-3.5" /> Mathematical Transparency
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight flex items-center justify-center gap-2.5 flex-wrap">
              <span>The Compatibility Engine</span>
              <button
                onClick={() => setIsExplainerOpen(true)}
                title="Click to see how match score percentage is calculated"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-[#14b8a6]/20 border border-white/15 hover:border-[#14b8a6]/40 text-xs font-medium text-white/70 hover:text-[#14b8a6] transition-all cursor-pointer shadow-xs"
              >
                <span className="w-4 h-4 rounded-full bg-[#14b8a6]/20 text-[#14b8a6] text-[10px] font-black inline-flex items-center justify-center border border-[#14b8a6]/40">
                  ?
                </span>
                <span>How is % calculated?</span>
              </button>
            </h2>
            <p className="mt-2 text-sm text-white/50 leading-relaxed">
              Every Contributor × Project pair is scored from <strong>0% to 100%</strong> using a deterministic 5-parameter weighted formula. No random black box.
            </p>
          </div>

          {/* Quick Formula Highlights Strip */}
          <div className="max-w-4xl mx-auto mb-8 p-4 rounded-2xl bg-[#12121A] border border-white/10 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#14b8a6]/15 border border-[#14b8a6]/30 text-[#14b8a6]">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>5-Parameter Weighted Composition</span>
                    <span className="text-[10px] text-[#14b8a6] font-mono">(Sum = 100%)</span>
                  </div>
                  <div className="text-[11px] text-white/50 mt-0.5">
                    Skill (40%) + Role (20%) + Bandwidth (15%) + Seniority (15%) + Domain (10%)
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsExplainerOpen(true)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#14b8a6]/20 border border-white/15 hover:border-[#14b8a6]/40 text-white hover:text-[#14b8a6] text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0"
              >
                <span className="w-4 h-4 rounded-full bg-white/10 text-[10px] font-black inline-flex items-center justify-center border border-white/20">
                  ?
                </span>
                <span>View Full Math & Parameters</span>
              </button>
            </div>

            {/* 5 Parameter Quick Badges with ? tooltips */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-3 border-t border-white/5 text-[11px]">
              <div 
                onClick={() => setIsExplainerOpen(true)}
                className="p-2 rounded-xl bg-black/40 border border-[#14b8a6]/20 flex items-center justify-between cursor-pointer hover:border-[#14b8a6] transition-colors"
                title="Skill Overlap: 40% weight - click for formula"
              >
                <span className="text-white/60 flex items-center gap-1">1. Skill Overlap <span className="text-[#14b8a6] font-bold">?</span></span>
                <span className="text-[#14b8a6] font-black font-mono">40%</span>
              </div>
              <div 
                onClick={() => setIsExplainerOpen(true)}
                className="p-2 rounded-xl bg-black/40 border border-indigo-500/20 flex items-center justify-between cursor-pointer hover:border-indigo-400 transition-colors"
                title="Role Congruence: 20% weight - click for formula"
              >
                <span className="text-white/60 flex items-center gap-1">2. Role Fit <span className="text-indigo-300 font-bold">?</span></span>
                <span className="text-indigo-300 font-black font-mono">20%</span>
              </div>
              <div 
                onClick={() => setIsExplainerOpen(true)}
                className="p-2 rounded-xl bg-black/40 border border-emerald-500/20 flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-colors"
                title="Bandwidth / Availability: 15% weight - click for formula"
              >
                <span className="text-white/60 flex items-center gap-1">3. Bandwidth <span className="text-emerald-300 font-bold">?</span></span>
                <span className="text-emerald-300 font-black font-mono">15%</span>
              </div>
              <div 
                onClick={() => setIsExplainerOpen(true)}
                className="p-2 rounded-xl bg-black/40 border border-sky-500/20 flex items-center justify-between cursor-pointer hover:border-sky-400 transition-colors"
                title="Seniority Delta: 15% weight - click for formula"
              >
                <span className="text-white/60 flex items-center gap-1">4. Seniority <span className="text-sky-300 font-bold">?</span></span>
                <span className="text-sky-300 font-black font-mono">15%</span>
              </div>
              <div 
                onClick={() => setIsExplainerOpen(true)}
                className="p-2 rounded-xl bg-black/40 border border-fuchsia-500/20 flex items-center justify-between cursor-pointer hover:border-fuchsia-400 transition-colors"
                title="Domain Passion: 10% weight - click for formula"
              >
                <span className="text-white/60 flex items-center gap-1">5. Domain Fit <span className="text-fuchsia-300 font-bold">?</span></span>
                <span className="text-fuchsia-300 font-black font-mono">10%</span>
              </div>
            </div>
          </div>

          {/* Interactive Calculation Card */}
          <div className="max-w-4xl mx-auto bg-white/5 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Left Controls */}
              <div className="md:col-span-7 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#14b8a6]">
                    Interactive Live Simulation
                  </span>
                  <button
                    onClick={() => setIsExplainerOpen(true)}
                    className="text-xs text-white/40 hover:text-[#14b8a6] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Parameters explained</span>
                    <span className="w-4 h-4 rounded-full bg-white/10 text-white/70 text-[10px] font-bold inline-flex items-center justify-center">?</span>
                  </button>
                </div>

                {/* Skill Overlap Control */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                      <span>1. Required Skill Overlap</span>
                      <span className="text-[#14b8a6] font-bold font-mono text-[11px]">(40% weight)</span>
                    </label>
                    <button
                      onClick={() => setIsExplainerOpen(true)}
                      className="text-[10px] text-white/40 hover:text-[#14b8a6] flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Rule</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-white/5 text-[9px] font-bold inline-flex items-center justify-center">?</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'high', label: 'Full Overlap (React + PyTorch)' },
                      { id: 'mid', label: 'Partial (React only)' },
                      { id: 'low', label: 'Different Stack' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setInteractiveSkill(opt.id as any)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                          interactiveSkill === opt.id
                            ? 'bg-[#14b8a6]/20 border border-[#14b8a6] text-[#14b8a6] shadow-[0_0_12px_rgba(20,184,166,0.2)]'
                            : 'bg-[#08080A] border border-white/5 text-white/50 hover:border-white/20'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability Control */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                      <span>2. Contributor Availability</span>
                      <span className="text-emerald-400 font-bold font-mono text-[11px]">(15% weight)</span>
                    </label>
                    <button
                      onClick={() => setIsExplainerOpen(true)}
                      className="text-[10px] text-white/40 hover:text-emerald-300 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Rule</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-white/5 text-[9px] font-bold inline-flex items-center justify-center">?</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'available', label: 'Available (20h/wk)', status: 'available' },
                      { id: 'open_to_explore', label: 'Exploring (10h/wk)', status: 'open_to_explore' },
                      { id: 'occupied', label: 'Occupied (<5h)', status: 'occupied' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setInteractiveAvail(opt.id as any)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                          interactiveAvail === opt.id
                            ? 'bg-white/10 border border-[#6366f1] text-white shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                            : 'bg-[#08080A] border border-white/5 text-white/50 hover:border-white/20'
                        }`}
                      >
                        <StatusDot status={opt.status as any} size="sm" />
                        <span className="truncate">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience Fit */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                      <span>3. Seniority & Role Alignment</span>
                      <span className="text-indigo-400 font-bold font-mono text-[11px]">(35% weight)</span>
                    </label>
                    <button
                      onClick={() => setIsExplainerOpen(true)}
                      className="text-[10px] text-white/40 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Rule</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-white/5 text-[9px] font-bold inline-flex items-center justify-center">?</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setInteractiveExp('match')}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        interactiveExp === 'match'
                          ? 'bg-[#6366f1]/20 border border-[#6366f1] text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                          : 'bg-[#08080A] border border-white/5 text-white/50 hover:border-white/20'
                      }`}
                    >
                      Exact Level (Senior / Intermediate)
                    </button>
                    <button
                      onClick={() => setInteractiveExp('junior')}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        interactiveExp === 'junior'
                          ? 'bg-[#6366f1]/20 border border-[#6366f1] text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                          : 'bg-[#08080A] border border-white/5 text-white/50 hover:border-white/20'
                      }`}
                    >
                      Adjacent Domain Experience
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Output Gauge & Natural Breakdown */}
              <div className="md:col-span-5 bg-[#08080A] p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center relative">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                    Live Score Output
                  </span>
                  <button
                    onClick={() => setIsExplainerOpen(true)}
                    className="w-4 h-4 rounded-full bg-white/10 hover:bg-[#14b8a6]/20 text-white/60 hover:text-[#14b8a6] text-[10px] font-black inline-flex items-center justify-center border border-white/15 cursor-pointer"
                    title="See calculation details"
                  >
                    ?
                  </button>
                </div>

                <MatchGauge score={demoScore} size="hero" showInfoButton />
                
                <div className="mt-4 text-xs text-white/70 bg-white/5 border border-white/5 p-3.5 rounded-xl w-full text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#14b8a6]">
                      Plain-English Synthesis:
                    </span>
                    <button
                      onClick={() => setIsExplainerOpen(true)}
                      className="text-[10px] text-[#14b8a6] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Math Breakdown</span>
                      <span className="w-3 h-3 rounded-full bg-[#14b8a6]/20 text-[8px] font-bold inline-flex items-center justify-center">?</span>
                    </button>
                  </div>
                  {demoScore >= 80 ? (
                    <span>"Exceptional alignment on React & PyTorch stack. Immediate availability for 20 hrs/week. Ready to build."</span>
                  ) : demoScore >= 60 ? (
                    <span>"Strong partial match. Has core frontend skills with capacity to scale into backend requirements."</span>
                  ) : (
                    <span>"Cross-functional perspective. Would benefit from supplemental technical onboarding for this project difficulty."</span>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Feed Preview */}
      <section id="featured-projects" className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Active Projects Seeking Companions
            </h2>
            <p className="text-sm text-white/40 mt-1">
              Real projects looking for designers, developers, and researchers right now.
            </p>
          </div>
          <button
            onClick={onStartJoining}
            className="text-xs font-semibold text-[#14b8a6] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            Explore all projects <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProjects.slice(0, 3).map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="bg-white/5 border border-white/5 hover:border-white/20 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold text-[#14b8a6] bg-[#14b8a6]/10 border border-[#14b8a6]/20 px-2.5 py-0.5 rounded-full">
                    {project.projectType}
                  </span>
                  <span className="text-xs text-white/40">
                    {project.domain}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-white group-hover:text-[#14b8a6] transition-colors line-clamp-1">
                  {project.title}
                </h3>
                <p className="text-xs text-white/50 mt-2 line-clamp-2 leading-relaxed">
                  {project.tagline}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {project.requiredSkills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-0.5 rounded-full bg-white/5 text-white/60 text-[10px] border border-white/5 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {project.requiredSkills.length > 4 && (
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/30 text-[10px]">
                      +{project.requiredSkills.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Footer with Owner and Spots */}
              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
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
                  <span className="text-white/60 text-[11px] truncate max-w-[100px]">
                    {project.owner.name}
                  </span>
                </div>

                <span className="text-[#14b8a6] text-xs font-semibold group-hover:underline inline-flex items-center gap-1">
                  View Roles <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Companions Community Spotlight */}
      <section className="py-14 bg-[#08080A] border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              Ready Companions in the Network
            </h2>
            <p className="text-xs sm:text-sm text-white/40 mt-1">
              Verified engineers, designers, and strategists with clear availability status.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {candidates.slice(0, 4).map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => onViewCandidate(candidate)}
                className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all text-center flex flex-col items-center cursor-pointer group"
              >
                <div className="relative mb-2.5">
                  <img
                    src={candidate.avatar}
                    alt={candidate.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-white/10 group-hover:border-[#14b8a6] transition-colors"
                  />
                  <StatusDot
                    status={candidate.availability}
                    size="md"
                    className="absolute bottom-0 right-0"
                  />
                </div>

                <div className="font-display font-bold text-sm text-white group-hover:text-[#14b8a6] truncate w-full">
                  {candidate.name}
                </div>
                <div className="text-[11px] text-white/40 truncate w-full mt-0.5">
                  {candidate.primaryRole}
                </div>

                <div className="mt-3 flex flex-wrap justify-center gap-1">
                  {candidate.skills.slice(0, 2).map((sk) => (
                    <span
                      key={sk.name}
                      className="text-[9px] px-2.5 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/5 font-medium"
                    >
                      {sk.name}
                    </span>
                  ))}
                </div>

                <div className="mt-3 pt-2 w-full border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                  <span>{candidate.experienceLevel}</span>
                  <span className="text-[#14b8a6] font-bold">{candidate.hoursPerWeek}h/wk</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-white/5 bg-[#08080A] text-xs text-white/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-white/40">• साथी (Companion Engine)</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white/50 text-[11px]">Theme:</span>
              <ThemeToggle variant="pill" showLabel />
            </div>
            <div className="text-center sm:text-right">
              <span>ProjectSaathi — Your project. Your people.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Percentage Calculation Explainer Modal */}
      {isExplainerOpen && (
        <MatchScoreExplainerModal
          isOpen={isExplainerOpen}
          onClose={() => setIsExplainerOpen(false)}
          initialScore={demoScore}
        />
      )}
    </div>
  );
};
