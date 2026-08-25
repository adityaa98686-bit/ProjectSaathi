import React from 'react';
import { AvailabilityStatus } from '../types';

interface StatusDotProps {
  status: AvailabilityStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  isInteractive?: boolean;
  onToggle?: (newStatus: AvailabilityStatus) => void;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = 'md',
  showLabel = false,
  className = '',
  isInteractive = false,
  onToggle,
}) => {
  const config = {
    available: {
      color: 'bg-[#14b8a6]',
      border: 'border-[#14b8a6]/40',
      glow: 'shadow-[0_0_8px_rgba(20,184,166,0.7)]',
      ping: 'bg-[#14b8a6]',
      label: 'Available',
      badgeBg: 'bg-[#14b8a6]/10 text-[#14b8a6] border-[#14b8a6]/20',
    },
    open_to_explore: {
      color: 'bg-amber-400',
      border: 'border-amber-400/40',
      glow: 'shadow-[0_0_8px_rgba(251,191,36,0.6)]',
      ping: 'bg-amber-400',
      label: 'Open to Explore',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    },
    occupied: {
      color: 'bg-white/30',
      border: 'border-white/20',
      glow: '',
      ping: '',
      label: 'Occupied',
      badgeBg: 'bg-white/5 text-white/40 border-white/10',
    },
  };

  const current = config[status] || config.available;

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const handleNextStatus = () => {
    if (!isInteractive || !onToggle) return;
    const nextMap: Record<AvailabilityStatus, AvailabilityStatus> = {
      available: 'open_to_explore',
      open_to_explore: 'occupied',
      occupied: 'available',
    };
    onToggle(nextMap[status]);
  };

  if (showLabel) {
    return (
      <button
        type="button"
        disabled={!isInteractive}
        onClick={handleNextStatus}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
          current.badgeBg
        } ${isInteractive ? 'cursor-pointer hover:brightness-110 active:scale-95' : 'cursor-default'} ${className}`}
        title={isInteractive ? 'Click to change availability' : `Status: ${current.label}`}
      >
        <span className="relative flex h-2 w-2">
          {status === 'available' && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.ping}`} />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${current.color} ${current.glow}`} />
        </span>
        <span>{current.label}</span>
      </button>
    );
  }

  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      title={`Availability: ${current.label}`}
    >
      {status === 'available' && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-70 ${current.ping}`} />
      )}
      <span
        className={`relative inline-flex rounded-full border border-[#08080A] ${dotSizes[size]} ${current.color} ${current.glow}`}
      />
    </span>
  );
};

