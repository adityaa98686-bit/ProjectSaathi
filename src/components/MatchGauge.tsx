import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MatchScoreInfoButton } from './MatchScoreInfoButton';

interface MatchGaugeProps {
  score: number; // 0 - 100
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showLabel?: boolean;
  label?: string;
  animate?: boolean;
  className?: string;
  showInfoButton?: boolean;
  breakdown?: {
    skillOverlapScore?: number;
    roleFitScore?: number;
    availabilityScore?: number;
    experienceFitScore?: number;
    interestScore?: number;
    explanation?: string;
  };
}

export const MatchGauge: React.FC<MatchGaugeProps> = ({
  score,
  size = 'md',
  showLabel = true,
  label = 'Match',
  animate = true,
  className = '',
  showInfoButton = false,
  breakdown,
}) => {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      return;
    }

    let start = 0;
    const duration = 900; // ms
    const stepTime = 16;
    const totalSteps = duration / stepTime;
    const stepIncrement = score / totalSteps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepIncrement;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score, animate]);

  const configs = {
    sm: {
      dimension: 48,
      strokeWidth: 4,
      radius: 20,
      fontSize: 'text-xs font-bold',
      subText: 'text-[9px]',
    },
    md: {
      dimension: 68,
      strokeWidth: 5.5,
      radius: 28,
      fontSize: 'text-base font-bold',
      subText: 'text-[10px]',
    },
    lg: {
      dimension: 96,
      strokeWidth: 7,
      radius: 40,
      fontSize: 'text-2xl font-extrabold',
      subText: 'text-xs',
    },
    hero: {
      dimension: 130,
      strokeWidth: 9,
      radius: 54,
      fontSize: 'text-3xl font-extrabold',
      subText: 'text-xs tracking-wider uppercase',
    },
  };

  const { dimension, strokeWidth, radius, fontSize, subText } = configs[size];
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  // Gradient selection based on match tier
  const getGradientId = (idPrefix = 'gaugeGrad') => `${idPrefix}-${size}-${Math.round(score)}`;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: dimension, height: dimension }}>
        <svg
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
          className="transform -rotate-90"
        >
          <defs>
            <linearGradient id={getGradientId()} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="60%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
            <filter id={`glow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
          />

          {/* Animated Value Stroke */}
          <motion.circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="transparent"
            stroke={`url(#${getGradientId()})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter={score >= 75 ? `url(#glow-${size})` : undefined}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-display font-black text-white tracking-tight ${fontSize} leading-none`}>
            {displayScore}%
          </span>
          {size !== 'sm' && showLabel && (
            <span className={`text-white/40 font-bold uppercase tracking-widest ${subText} mt-0.5`}>
              {label}
            </span>
          )}
        </div>

        {/* Optional Question Mark Info Trigger Overlay */}
        {showInfoButton && (
          <div className="absolute -top-1 -right-1 z-10">
            <MatchScoreInfoButton 
              score={score} 
              breakdown={breakdown} 
              size={size === 'hero' || size === 'lg' ? 'sm' : 'xs'} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

