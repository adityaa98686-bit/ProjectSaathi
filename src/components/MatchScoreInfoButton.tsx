import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { MatchScoreExplainerModal } from './MatchScoreExplainerModal';

interface MatchScoreInfoButtonProps {
  score?: number;
  breakdown?: {
    skillOverlapScore?: number;
    roleFitScore?: number;
    availabilityScore?: number;
    experienceFitScore?: number;
    interestScore?: number;
    explanation?: string;
  };
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  label?: string;
  className?: string;
  variant?: 'pill' | 'circle' | 'link';
}

export const MatchScoreInfoButton: React.FC<MatchScoreInfoButtonProps> = ({
  score,
  breakdown,
  size = 'sm',
  showLabel = false,
  label = 'How calculated?',
  className = '',
  variant = 'circle',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sizeClasses = {
    xs: 'w-4 h-4 text-[10px]',
    sm: 'w-5 h-5 text-[11px]',
    md: 'w-6 h-6 text-xs',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <>
      {variant === 'circle' && (
        <button
          type="button"
          onClick={handleOpen}
          title="See how this match percentage was calculated"
          className={`inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-[#14b8a6]/20 border border-white/15 hover:border-[#14b8a6]/40 text-white/60 hover:text-[#14b8a6] transition-all cursor-pointer group shadow-xs focus:outline-none focus:ring-1 focus:ring-[#14b8a6] ${sizeClasses[size]} ${className}`}
        >
          <span className="font-black leading-none group-hover:scale-110 transition-transform">?</span>
        </button>
      )}

      {variant === 'pill' && (
        <button
          type="button"
          onClick={handleOpen}
          title="See how this match percentage was calculated"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#14b8a6]/15 border border-white/10 hover:border-[#14b8a6]/40 text-white/60 hover:text-[#14b8a6] text-[11px] font-medium transition-all cursor-pointer focus:outline-none ${className}`}
        >
          <span className="w-3.5 h-3.5 rounded-full bg-white/10 text-white/80 text-[9px] font-black inline-flex items-center justify-center border border-white/20">
            ?
          </span>
          {showLabel && <span>{label}</span>}
        </button>
      )}

      {variant === 'link' && (
        <button
          type="button"
          onClick={handleOpen}
          title="See how this match percentage was calculated"
          className={`inline-flex items-center gap-1 text-[11px] text-[#14b8a6] hover:text-teal-300 transition-colors cursor-pointer focus:outline-none ${className}`}
        >
          <span className="w-3.5 h-3.5 rounded-full bg-[#14b8a6]/20 text-[#14b8a6] text-[9px] font-black inline-flex items-center justify-center border border-[#14b8a6]/30">
            ?
          </span>
          <span className="underline decoration-dotted underline-offset-2">{label}</span>
        </button>
      )}

      {isModalOpen && (
        <MatchScoreExplainerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialScore={score}
          initialBreakdown={breakdown}
        />
      )}
    </>
  );
};
