import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Percent, 
  Cpu, 
  Briefcase, 
  Clock, 
  TrendingUp, 
  Compass, 
  Sparkles, 
  Calculator, 
  Sliders,
  CheckCircle2,
  Info,
  Layers
} from 'lucide-react';
import { MatchGauge } from './MatchGauge';
import { StatusDot } from './StatusDot';
import { AvailabilityStatus, ExperienceLevel } from '../types';

interface MatchScoreExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialScore?: number;
  initialBreakdown?: {
    skillOverlapScore?: number;
    roleFitScore?: number;
    availabilityScore?: number;
    experienceFitScore?: number;
    interestScore?: number;
    explanation?: string;
  };
}

export const MatchScoreExplainerModal: React.FC<MatchScoreExplainerModalProps> = ({
  isOpen,
  onClose,
  initialScore,
  initialBreakdown,
}) => {
  const [activeTab, setActiveTab] = useState<'formula' | 'simulator'>('formula');

  // Simulator State
  const [simSkillRatio, setSimSkillRatio] = useState<number>(initialBreakdown?.skillOverlapScore ?? 80);
  const [simRoleFit, setSimRoleFit] = useState<number>(initialBreakdown?.roleFitScore ?? 90);
  const [simAvail, setSimAvail] = useState<AvailabilityStatus>('available');
  const [simExpLevel, setSimExpLevel] = useState<ExperienceLevel>('Intermediate');
  const [simProjDiff, setSimProjDiff] = useState<ExperienceLevel>('Intermediate');
  const [simDomainMatch, setSimDomainMatch] = useState<boolean>(true);

  if (!isOpen) return null;

  // Compute availability score
  const getAvailScore = (status: AvailabilityStatus) => {
    if (status === 'available') return 100;
    if (status === 'open_to_explore') return 75;
    return 25;
  };

  // Compute experience score
  const getExpScore = (userLvl: ExperienceLevel, projLvl: ExperienceLevel) => {
    const ranks: Record<ExperienceLevel, number> = {
      'Beginner': 1,
      'Intermediate': 2,
      'Advanced': 3,
      'Lead': 4,
    };
    const diff = (ranks[userLvl] || 2) - (ranks[projLvl] || 2);
    if (diff === 0) return 100;
    if (diff === 1) return 95;
    if (diff === 2) return 90;
    if (diff === -1) return 70;
    return 45;
  };

  const simAvailScore = getAvailScore(simAvail);
  const simExpScore = getExpScore(simExpLevel, simProjDiff);
  const simDomainScore = simDomainMatch ? 100 : 50;

  // Total weighted simulated score
  const computedSimScore = Math.min(
    99,
    Math.max(
      12,
      Math.round(
        simSkillRatio * 0.40 +
        simRoleFit * 0.20 +
        simAvailScore * 0.15 +
        simExpScore * 0.15 +
        simDomainScore * 0.10
      )
    )
  );

  const parameters = [
    {
      id: 'skill',
      name: 'Skill Overlap',
      weight: '40%',
      weightNum: 0.40,
      icon: Cpu,
      color: 'text-[#14b8a6]',
      bg: 'bg-[#14b8a6]/10',
      border: 'border-[#14b8a6]/30',
      barColor: 'bg-[#14b8a6]',
      currentScore: initialBreakdown?.skillOverlapScore ?? 85,
      description: 'Calculates the direct intersection between the technologies in your verified stack and the project’s required tech stack (e.g. React, TypeScript, PyTorch, Node.js).',
      formula: '(Matched Project Skills ÷ Total Required Skills) × 100',
      example: 'If a project requires 4 skills and you possess 3 of them, this yields a 75% skill score (contributing 30.0% to the total score).'
    },
    {
      id: 'role',
      name: 'Role Congruence',
      weight: '20%',
      weightNum: 0.20,
      icon: Briefcase,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
      barColor: 'bg-[#6366f1]',
      currentScore: initialBreakdown?.roleFitScore ?? 90,
      description: 'Evaluates whether your primary discipline (e.g. Frontend Engineer, ML Specialist, Product Designer) matches the open roles and role-specific sub-requirements of the squad.',
      formula: '100% for direct role match, 70–85% for adjacent roles with overlapping responsibilities',
      example: 'A Full-Stack Developer applying for a Backend Engineer open position achieves 100% role congruence.'
    },
    {
      id: 'availability',
      name: 'Bandwidth & Availability',
      weight: '15%',
      weightNum: 0.15,
      icon: Clock,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      barColor: 'bg-emerald-400',
      currentScore: initialBreakdown?.availabilityScore ?? (initialBreakdown ? 75 : 100),
      description: 'Assesses whether you have the active hours and capacity to contribute synchronously and meet project milestones.',
      formula: 'Available (20+ hrs/wk) = 100% | Exploring (~10 hrs/wk) = 75% | Occupied (<5 hrs/wk) = 25%',
      example: 'Being marked as "Available" gives the full 15% contribution; "Exploring" awards 11.25%.'
    },
    {
      id: 'experience',
      name: 'Experience & Seniority Delta',
      weight: '15%',
      weightNum: 0.15,
      icon: TrendingUp,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30',
      barColor: 'bg-sky-400',
      currentScore: initialBreakdown?.experienceFitScore ?? 80,
      description: 'Compares your professional or academic seniority tier (Beginner, Intermediate, Advanced, Lead) against the architectural complexity/difficulty of the project.',
      formula: 'Exact Match = 100% | 1 Tier Above = 95% | 1 Tier Below = 70% | 2+ Tiers Below = 45%',
      example: 'An Intermediate engineer applying for an Intermediate project scores 100% (contributing 15.0%).'
    },
    {
      id: 'domain',
      name: 'Domain & Sector Alignment',
      weight: '10%',
      weightNum: 0.10,
      icon: Compass,
      color: 'text-fuchsia-400',
      bg: 'bg-fuchsia-500/10',
      border: 'border-fuchsia-500/30',
      barColor: 'bg-fuchsia-400',
      currentScore: initialBreakdown?.interestScore ?? 90,
      description: 'Measures your personal interests, hackathon track preferences, and domain focus against the project sector (e.g. AI / LLMs, FinTech, Climate, HealthTech, Web3).',
      formula: 'Direct Sector Interest = 100% | Related Category = 75% | General = 40–50%',
      example: 'A developer with "AI/LLM" in their interests applying to an AI agent tool scores 100% (contributing 10.0%).'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0C0C12] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] flex items-start justify-between gap-4 bg-gradient-to-r from-[#6366f1]/10 via-transparent to-[#14b8a6]/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#14b8a6]/15 border border-[#14b8a6]/30 text-[#14b8a6] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> ProjectSaathi Compatibility Algorithm
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>How Match Percentage Is Calculated</span>
              <span className="w-6 h-6 rounded-full bg-white/10 text-white/80 text-xs font-black inline-flex items-center justify-center border border-white/15">
                ?
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-white/50">
              Transparent, weighted 5-parameter scoring designed to build balanced squads and eliminate mismatched expectations.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-4 border-b border-white/[0.06] flex items-center gap-2 bg-[#08080A]">
          <button
            onClick={() => setActiveTab('formula')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'formula'
                ? 'bg-white/10 border-[#14b8a6] text-white'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calculator className="w-4 h-4 text-[#14b8a6]" />
            <span>Formula & Parameter Weights</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'simulator'
                ? 'bg-white/10 border-[#6366f1] text-white'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Interactive Live Simulator</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {activeTab === 'formula' ? (
            <div className="space-y-6">
              
              {/* Formula Master Banner */}
              <div className="p-5 rounded-2xl bg-[#14141E] border border-white/10 space-y-3 shadow-lg">
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span className="font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-[#14b8a6]" /> The Exact Mathematical Formula
                  </span>
                  <span className="text-[11px] text-white/40">Weights sum to exactly 100%</span>
                </div>

                {/* Mathematical Formula Box */}
                <div className="p-4 rounded-xl bg-black/60 border border-white/5 font-mono text-xs sm:text-sm text-[#14b8a6] leading-relaxed overflow-x-auto">
                  <div className="text-white font-sans text-xs font-semibold mb-1 text-white/80">
                    Total Match % =
                  </div>
                  <div className="whitespace-nowrap">
                    (<span className="text-[#14b8a6] font-bold">Skill Overlap</span> × <span className="text-white font-bold">0.40</span>) + 
                    (<span className="text-indigo-300 font-bold"> Role Fit</span> × <span className="text-white font-bold">0.20</span>) + 
                    (<span className="text-emerald-300 font-bold"> Availability</span> × <span className="text-white font-bold">0.15</span>) + 
                    (<span className="text-sky-300 font-bold"> Experience Fit</span> × <span className="text-white font-bold">0.15</span>) + 
                    (<span className="text-fuchsia-300 font-bold"> Domain Passion</span> × <span className="text-white font-bold">0.10</span>)
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-[#14b8a6]/10 border border-[#14b8a6]/20 text-center">
                    <span className="text-[10px] text-white/50 block">Skill</span>
                    <span className="text-xs font-extrabold text-[#14b8a6]">40%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-center">
                    <span className="text-[10px] text-white/50 block">Role</span>
                    <span className="text-xs font-extrabold text-indigo-300">20%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <span className="text-[10px] text-white/50 block">Bandwidth</span>
                    <span className="text-xs font-extrabold text-emerald-300">15%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-center">
                    <span className="text-[10px] text-white/50 block">Experience</span>
                    <span className="text-xs font-extrabold text-sky-300">15%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 text-center">
                    <span className="text-[10px] text-white/50 block">Domain</span>
                    <span className="text-xs font-extrabold text-fuchsia-300">10%</span>
                  </div>
                </div>
              </div>

              {/* The 5 Core Parameters Deep Dive */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#14b8a6]" />
                    <span>The 5 Evaluation Parameters</span>
                  </h3>
                  <span className="text-xs text-white/40">Click sliders tab to test your own profile</span>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {parameters.map((param, idx) => {
                    const Icon = param.icon;
                    return (
                      <div
                        key={param.id}
                        className={`p-4 rounded-2xl bg-white/[0.03] border ${param.border} hover:bg-white/[0.05] transition-all space-y-2.5`}
                      >
                        <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-xl ${param.bg} border ${param.border}`}>
                              <Icon className={`w-4 h-4 ${param.color}`} />
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                                <span>{idx + 1}. {param.name}</span>
                                <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${param.bg} ${param.color} border ${param.border}`}>
                                  {param.weight} Weight
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-[11px] font-mono text-white/40 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                            Multiplier: {param.weightNum}
                          </div>
                        </div>

                        <p className="text-xs text-white/70 leading-relaxed pl-1">
                          {param.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                            <span className="text-white/40 font-bold block mb-0.5">Calculation Rule:</span>
                            <span className="text-white/80 font-mono">{param.formula}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                            <span className="text-white/40 font-bold block mb-0.5">Concrete Example:</span>
                            <span className="text-white/70">{param.example}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* What Match Tiers Mean */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> What the Percentage Scores Mean
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <div className="font-extrabold text-emerald-300">80% – 99% (High Synergy)</div>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      Near-perfect tech stack alignment, high bandwidth, and exact seniority match. Immediate sprint readiness.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                    <div className="font-extrabold text-indigo-300">60% – 79% (Strong Fit)</div>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      Has the core skills with capacity to bridge adjacent stack items with minimal onboarding.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                    <div className="font-extrabold text-amber-300">Below 60% (Growth Match)</div>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      Cross-functional interest or different tech stack; great for mentorship roles or experimental squads.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Tab 2: Interactive Simulator */
            <div className="space-y-6">
              
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3 text-xs text-indigo-200">
                <Info className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>
                  Adjust any of the 5 parameters below to observe in real time how the overall compatibility percentage changes according to the weighted formula.
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Left: Interactive Controls */}
                <div className="lg:col-span-7 space-y-5 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                  
                  {/* Parameter 1: Skill Overlap */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-white flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-[#14b8a6]" /> 1. Skill Overlap (40%)
                      </span>
                      <span className="text-[#14b8a6] font-bold font-mono">{simSkillRatio}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={simSkillRatio}
                      onChange={(e) => setSimSkillRatio(Number(e.target.value))}
                      className="w-full accent-[#14b8a6] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-white/40">
                      <span>0% No stack match</span>
                      <span>50% Partial</span>
                      <span>100% Full match</span>
                    </div>
                  </div>

                  {/* Parameter 2: Role Fit */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-white flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> 2. Role Fit (20%)
                      </span>
                      <span className="text-indigo-300 font-bold font-mono">{simRoleFit}%</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Direct Role (100%)', val: 100 },
                        { label: 'Adjacent (75%)', val: 75 },
                        { label: 'Different (40%)', val: 40 },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          onClick={() => setSimRoleFit(opt.val)}
                          className={`p-2 rounded-xl text-xs font-medium transition-all text-center cursor-pointer ${
                            simRoleFit === opt.val
                              ? 'bg-indigo-500/20 border border-indigo-400 text-indigo-200'
                              : 'bg-black/40 border border-white/5 text-white/50 hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Parameter 3: Availability */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" /> 3. Availability (15%)
                      </span>
                      <span className="text-emerald-300 font-bold font-mono">{simAvailScore}%</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'available', label: 'Available (20h)', score: 100 },
                        { id: 'open_to_explore', label: 'Exploring (10h)', score: 75 },
                        { id: 'occupied', label: 'Occupied (<5h)', score: 25 },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSimAvail(opt.id as any)}
                          className={`p-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            simAvail === opt.id
                              ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-200'
                              : 'bg-black/40 border border-white/5 text-white/50 hover:text-white'
                          }`}
                        >
                          <StatusDot status={opt.id as any} size="sm" />
                          <span className="text-[11px] truncate">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Parameter 4: Experience Level & Project Difficulty */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-white flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-sky-400" /> 4. Experience Fit (15%)
                      </span>
                      <span className="text-sky-300 font-bold font-mono">{simExpScore}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-white/40 block mb-1">Contributor Seniority:</span>
                        <select
                          value={simExpLevel}
                          onChange={(e) => setSimExpLevel(e.target.value as any)}
                          className="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Lead">Lead</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-[10px] text-white/40 block mb-1">Project Difficulty:</span>
                        <select
                          value={simProjDiff}
                          onChange={(e) => setSimProjDiff(e.target.value as any)}
                          className="w-full bg-black/60 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Lead">Lead</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Parameter 5: Domain Match */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-white flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-fuchsia-400" /> 5. Domain Passion (10%)
                      </span>
                      <span className="text-fuchsia-300 font-bold font-mono">{simDomainScore}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSimDomainMatch(true)}
                        className={`p-2 rounded-xl text-xs font-medium transition-all text-center cursor-pointer ${
                          simDomainMatch
                            ? 'bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200'
                            : 'bg-black/40 border border-white/5 text-white/50 hover:text-white'
                        }`}
                      >
                        ✓ Matched Domain Interest (100%)
                      </button>
                      <button
                        onClick={() => setSimDomainMatch(false)}
                        className={`p-2 rounded-xl text-xs font-medium transition-all text-center cursor-pointer ${
                          !simDomainMatch
                            ? 'bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200'
                            : 'bg-black/40 border border-white/5 text-white/50 hover:text-white'
                        }`}
                      >
                        General / Neutral Domain (50%)
                      </button>
                    </div>
                  </div>

                </div>

                {/* Right: Output Live Match Gauge & Breakdown */}
                <div className="lg:col-span-5 bg-[#14141E] p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center shadow-xl space-y-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                    Live Computed Percentage
                  </div>

                  <MatchGauge score={computedSimScore} size="hero" />

                  {/* Weight Contribution Table */}
                  <div className="w-full bg-black/40 rounded-xl p-3 border border-white/5 text-[11px] space-y-1.5 text-left font-mono">
                    <div className="flex justify-between text-white/50 text-[10px] uppercase font-bold border-b border-white/5 pb-1">
                      <span>Factor</span>
                      <span>Score × Weight</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span className="text-[#14b8a6]">Skill (40%)</span>
                      <span>{simSkillRatio} × 0.40 = <strong className="text-white">{(simSkillRatio * 0.40).toFixed(1)}%</strong></span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span className="text-indigo-300">Role (20%)</span>
                      <span>{simRoleFit} × 0.20 = <strong className="text-white">{(simRoleFit * 0.20).toFixed(1)}%</strong></span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span className="text-emerald-300">Bandwidth (15%)</span>
                      <span>{simAvailScore} × 0.15 = <strong className="text-white">{(simAvailScore * 0.15).toFixed(1)}%</strong></span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span className="text-sky-300">Experience (15%)</span>
                      <span>{simExpScore} × 0.15 = <strong className="text-white">{(simExpScore * 0.15).toFixed(1)}%</strong></span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span className="text-fuchsia-300">Domain (10%)</span>
                      <span>{simDomainScore} × 0.10 = <strong className="text-white">{(simDomainScore * 0.10).toFixed(1)}%</strong></span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-white/10 text-xs font-bold text-white">
                      <span>Final Sum:</span>
                      <span className="text-[#14b8a6]">{computedSimScore}%</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#08080A] flex items-center justify-between gap-4">
          <div className="text-xs text-white/40 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#14b8a6]" />
            <span>Updated in real time for every Contributor × Project pair</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white hover:bg-white/90 text-black text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
