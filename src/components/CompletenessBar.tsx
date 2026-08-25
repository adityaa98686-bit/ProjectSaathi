import React from 'react';
import { Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { calculateProfileCompleteness } from '../utils/resumeParser';
import { UserProfile } from '../types';

interface CompletenessBarProps {
  user: UserProfile;
  onActionClick?: () => void;
  className?: string;
}

export const CompletenessBar: React.FC<CompletenessBarProps> = ({
  user,
  onActionClick,
  className = '',
}) => {
  const { percentage, label, missingSteps } = calculateProfileCompleteness(user);

  return (
    <div
      className={`p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#14b8a6]/10 border border-[#14b8a6]/20 flex items-center justify-center text-[#14b8a6]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-white">
              Profile Strength: <span className="text-[#14b8a6]">{label}</span>
            </span>
          </div>
        </div>
        <span className="font-display font-black text-sm text-[#14b8a6]">
          {percentage}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden relative">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#6366f1] via-[#38bdf8] to-[#14b8a6] transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Nudge suggestions */}
      {missingSteps.length > 0 ? (
        <div className="mt-3 flex items-center justify-between text-xs text-white/50">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6] shrink-0" />
            <span className="truncate">Next: <strong className="text-white/80 font-medium">{missingSteps[0]}</strong></span>
          </div>
          {onActionClick && (
            <button
              onClick={onActionClick}
              className="text-[#14b8a6] hover:text-teal-300 font-semibold inline-flex items-center gap-0.5 shrink-0 ml-2 hover:underline cursor-pointer"
            >
              Complete <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#14b8a6]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Your profile has maximum match compatibility!</span>
        </div>
      )}
    </div>
  );
};

