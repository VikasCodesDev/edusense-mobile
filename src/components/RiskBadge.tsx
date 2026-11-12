'use client';

import React from 'react';

interface RiskBadgeProps {
  level?: string | null;
  score?: number | null;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function RiskBadge({ level, score, showScore = false, size = 'md' }: RiskBadgeProps) {
  const normLevel = String(level || '').toLowerCase();

  let bg = 'bg-slate-500/10 text-slate-300 border-slate-500/30';
  let dotBg = 'bg-slate-400';
  let label = 'Not evaluated';

  if (normLevel === 'high' || normLevel === 'critical') {
    bg = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    dotBg = 'bg-rose-400';
    label = 'High Risk';
  } else if (normLevel === 'moderate' || normLevel === 'medium') {
    bg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    dotBg = 'bg-amber-400';
    label = 'Moderate Risk';
  } else if (normLevel === 'low') {
    bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    dotBg = 'bg-emerald-400';
    label = 'Low Risk';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs sm:text-sm px-2.5 py-1',
    lg: 'text-sm sm:text-base px-3.5 py-1.5 font-medium',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${bg} ${sizeClasses[size]} tracking-wide shadow-sm`}>
      <span className={`h-2 w-2 rounded-full ${dotBg} ${normLevel ? 'animate-pulse' : ''}`} />
      <span>{label}</span>
      {showScore && score !== undefined && score !== null && Number.isFinite(score) && (
        <span className="ml-0.5 font-mono text-[11px] opacity-80">({score}/100)</span>
      )}
    </span>
  );
}
