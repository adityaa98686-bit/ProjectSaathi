import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-3 select-none group">
      {/* Immersive UI Gradient Companion Icon */}
      <div className={`relative ${iconSizes[size]} rounded-full bg-gradient-to-br from-[#6366f1] to-[#14b8a6] p-0.5 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105`}>
        <div className="w-full h-full rounded-full bg-[#08080A]/60 backdrop-blur-xs flex items-center justify-center relative overflow-hidden">
          <svg
            viewBox="0 0 32 32"
            className="w-5 h-5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="immersiveLogoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
            <path
              d="M8 24C8 16 14 13 16 10"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M24 24C24 16 18 13 16 10"
              stroke="#14b8a6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="16" cy="9" r="2.5" fill="#ffffff" />
            <circle cx="8" cy="24" r="1.5" fill="#6366f1" />
            <circle cx="24" cy="24" r="1.5" fill="#14b8a6" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-display font-bold tracking-tight text-white ${textSizes[size]}`}>
            Project<span className="bg-gradient-to-r from-[#6366f1] via-[#38bdf8] to-[#14b8a6] bg-clip-text text-transparent">Saathi</span>
          </span>
          <span className="text-[9px] uppercase font-bold tracking-widest text-[#14b8a6] bg-[#14b8a6]/10 border border-[#14b8a6]/20 px-1.5 py-0.5 rounded-full">
            साथी
          </span>
        </div>
        {showTagline && (
          <span className="text-xs text-white/40 font-normal tracking-normal -mt-0.5">
            Your project. Your people.
          </span>
        )}
      </div>
    </div>
  );
};

