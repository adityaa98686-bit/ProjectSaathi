import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'icon' | 'pill' | 'switch';
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  className = '',
  showLabel = false,
}) => {
  const { theme, toggleTheme, isBright } = useTheme();

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        title={isBright ? 'Switch to Dark Mode' : 'Switch to Bright Mode'}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-all cursor-pointer select-none text-xs font-semibold ${
          isBright
            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/30'
            : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 hover:border-white/20'
        } ${className}`}
      >
        {isBright ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
            <span>{showLabel ? 'Bright Mode' : 'Bright'}</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showLabel ? 'Dark Mode' : 'Dark'}</span>
          </>
        )}
      </button>
    );
  }

  if (variant === 'switch') {
    return (
      <div className={`flex items-center justify-between gap-3 p-1.5 rounded-xl border ${
        isBright ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
      } ${className}`}>
        <button
          type="button"
          onClick={() => isBright && toggleTheme()}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            !isBright
              ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Moon className="w-3 h-3 text-indigo-400" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => !isBright && toggleTheme()}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            isBright
              ? 'bg-amber-400 text-slate-900 border border-amber-500/40 shadow-xs font-bold'
              : 'text-white/40 hover:text-white'
          }`}
        >
          <Sun className="w-3 h-3 text-amber-900" />
          <span>Bright</span>
        </button>
      </div>
    );
  }

  // Default: Sleek Icon Button
  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isBright ? 'Switch to Dark Mode' : 'Switch to Bright Mode'}
      className={`relative p-2 rounded-full transition-all cursor-pointer group focus:outline-none ${
        isBright
          ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 shadow-sm'
          : 'bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white border border-white/[0.08]'
      } ${className}`}
      aria-label="Toggle Bright / Dark theme"
    >
      {isBright ? (
        <Sun className="w-4 h-4 text-amber-600 transition-transform group-hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-300 transition-transform group-hover:-rotate-12" />
      )}
    </button>
  );
};
