'use client';

import React from 'react';

interface GaugeMeterProps {
  label: string;
  value: number; // Valor numérico
  maxValue?: number;
  color?: 'cyan' | 'yellow' | 'red' | 'green';
  unit?: string;
}

export const GaugeMeter: React.FC<GaugeMeterProps> = ({
  label,
  value,
  maxValue = 100,
  color = 'cyan',
  unit = '%',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const blocks = 20; // 20 blocos gráficos estilo NFS
  const activeBlocks = Math.round((percentage / 100) * blocks);

  const colorMap = {
    cyan: 'bg-racing-cyan shadow-neon-cyan border-racing-cyan',
    yellow: 'bg-racing-yellow shadow-neon-yellow border-racing-yellow',
    red: 'bg-racing-red shadow-neon-red border-racing-red',
    green: 'bg-racing-green border-racing-green',
  };

  return (
    <div className="w-full my-2 font-display">
      <div className="flex justify-between items-center mb-1 text-xs">
        <span className="uppercase tracking-wider text-gray-400 font-bold">{label}</span>
        <span className="text-white font-extrabold text-sm">
          {value} <span className="text-xs text-gray-500">{unit}</span>
        </span>
      </div>

      {/* Grid de Blocos Arcade */}
      <div className="flex gap-1 bg-racing-bg p-1.5 rounded border border-racing-border">
        {Array.from({ length: blocks }).map((_, index) => {
          const isActive = index < activeBlocks;
          return (
            <div
              key={index}
              style={{ transitionDelay: `${index * 15}ms` }}
              className={`h-3 flex-1 rounded-sm transition-all duration-300 transform ${
                isActive
                  ? `${colorMap[color]} scale-y-100 opacity-100`
                  : 'bg-gray-800 scale-y-75 opacity-20'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
