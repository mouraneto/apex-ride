'use client';

import React from 'react';
import { Shield, Zap, Award } from 'lucide-react';

interface PilotBadgeProps {
  level: 'INICIANTE' | 'AMADOR' | 'INTERMEDIARIO' | 'AVANCADO' | 'PROFISSIONAL';
  showLimit?: boolean;
}

export const PilotBadge: React.FC<PilotBadgeProps> = ({ level, showLimit = true }) => {
  const config = {
    INICIANTE: {
      label: 'BRONZE PILOT',
      color: 'border-amber-700 bg-amber-950/40 text-amber-400',
      speedLimit: '100 km/h',
    },
    AMADOR: {
      label: 'SILVER PILOT',
      color: 'border-slate-400 bg-slate-900/50 text-slate-200',
      speedLimit: '160 km/h',
    },
    INTERMEDIARIO: {
      label: 'GOLD PILOT',
      color: 'border-racing-yellow bg-racing-yellow/10 text-racing-yellow shadow-neon-yellow',
      speedLimit: '220 km/h',
    },
    AVANCADO: {
      label: 'PLATINUM PILOT',
      color: 'border-racing-cyan bg-racing-cyan/10 text-racing-cyan shadow-neon-cyan',
      speedLimit: '280 km/h',
    },
    PROFISSIONAL: {
      label: 'PRO RACER',
      color: 'border-racing-purple bg-racing-purple/10 text-racing-purple',
      speedLimit: 'ILIMITADO',
    },
  }[level] || {
    label: 'ROOKIE',
    color: 'border-gray-500 bg-gray-900 text-gray-300',
    speedLimit: '100 km/h',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-display font-black tracking-wider ${config.color}`}>
      <Award className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
      {showLimit && (
        <span className="text-[10px] opacity-80 border-l border-current pl-2 ml-1">
          MAX: {config.speedLimit}
        </span>
      )}
    </div>
  );
};
