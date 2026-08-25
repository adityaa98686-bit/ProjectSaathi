import React from 'react';
import { RadarDataPoint } from '../types';

interface SkillGapRadarProps {
  data: RadarDataPoint[];
  size?: number;
  showLegend?: boolean;
  requiredLabel?: string;
  coveredLabel?: string;
  className?: string;
}

export const SkillGapRadar: React.FC<SkillGapRadarProps> = ({
  data,
  size = 280,
  showLegend = true,
  requiredLabel = 'Target Need',
  coveredLabel = 'Team Covered',
  className = '',
}) => {
  const center = size / 2;
  const radius = size * 0.38;
  const totalAxes = data.length;
  const angleSlice = (Math.PI * 2) / totalAxes;

  // Concentric levels (25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1.0];

  // Helper to calculate coordinates
  const getCoordinates = (value: number, index: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate polygon points string
  const requiredPoints = data
    .map((d, i) => {
      const { x, y } = getCoordinates(d.required, i);
      return `${x},${y}`;
    })
    .join(' ');

  const coveredPoints = data
    .map((d, i) => {
      const { x, y } = getCoordinates(d.covered, i);
      return `${x},${y}`;
    })
    .join(' ');

  // Calculate gaps
  const gaps = data.filter(d => d.covered < d.required * 0.7);

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          <defs>
            <linearGradient id="coveredRadarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="requiredRadarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.04" />
            </linearGradient>
            <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Concentric Web Grid */}
          {levels.map((lvl, lvlIdx) => {
            const gridPoints = data
              .map((_, i) => {
                const angle = angleSlice * i - Math.PI / 2;
                const r = lvl * radius;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                return `${x},${y}`;
              })
              .join(' ');

            return (
              <polygon
                key={`grid-${lvlIdx}`}
                points={gridPoints}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth={lvlIdx === levels.length - 1 ? '1.5' : '1'}
                strokeDasharray={lvlIdx === levels.length - 1 ? undefined : '3 3'}
              />
            );
          })}

          {/* Axis Lines */}
          {data.map((_, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1.2"
              />
            );
          })}

          {/* Required Target Area Polygon */}
          <polygon
            points={requiredPoints}
            fill="url(#requiredRadarGrad)"
            stroke="#6366f1"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Covered Area Polygon */}
          <polygon
            points={coveredPoints}
            fill="url(#coveredRadarGrad)"
            stroke="#14b8a6"
            strokeWidth="2"
            filter="url(#radarGlow)"
          />

          {/* Covered Points Nodes */}
          {data.map((d, i) => {
            const { x, y } = getCoordinates(d.covered, i);
            const isDeficit = d.covered < d.required * 0.6;
            return (
              <circle
                key={`node-${i}`}
                cx={x}
                cy={y}
                r="3.5"
                fill={isDeficit ? '#f59e0b' : '#14b8a6'}
                stroke="#08080A"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Axis Labels */}
          {data.map((d, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const labelR = radius + 22;
            const x = center + labelR * Math.cos(angle);
            const y = center + labelR * Math.sin(angle);
            
            // Text anchor calculation
            let textAnchor = 'middle';
            if (Math.abs(Math.cos(angle)) > 0.3) {
              textAnchor = Math.cos(angle) > 0 ? 'start' : 'end';
            }

            const isDeficit = d.covered < d.required * 0.6;

            return (
              <g key={`label-${i}`}>
                <text
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  className={`text-[10px] uppercase font-bold tracking-wider ${
                    isDeficit ? 'fill-amber-400' : 'fill-white/50'
                  }`}
                >
                  {d.dimension}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {showLegend && (
        <div className="flex items-center justify-center gap-5 mt-2 text-xs">
          <div className="flex items-center gap-1.5 text-white/70">
            <span className="w-3 h-3 rounded-sm bg-[#14b8a6]/40 border border-[#14b8a6] inline-block" />
            <span className="text-[11px] font-medium">{coveredLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-300">
            <span className="w-3 h-0.5 border-b-2 border-dashed border-indigo-400 inline-block" />
            <span className="text-[11px] font-medium">{requiredLabel}</span>
          </div>
        </div>
      )}

      {gaps.length > 0 && showLegend && (
        <div className="mt-2.5 text-center text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[11px]">Skill gap: <strong className="font-bold text-amber-200">{gaps.map(g => g.dimension).join(', ')}</strong></span>
        </div>
      )}
    </div>
  );
};
