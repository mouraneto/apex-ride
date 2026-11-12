'use client';

import React from 'react';
import { Gauge, Zap, Compass, AlertTriangle, Trophy } from 'lucide-react';

export interface LapTelemetry {
  lap_number: number;
  lap_time_seconds: number;
  max_speed_kmh: number;
  avg_speed_kmh: number;
  max_g_force: number;
  falls_count: number;
}

interface TelemetryChartProps {
  trackName: string;
  motorcycleName: string;
  laps: LapTelemetry[];
  bestLapSeconds?: number;
  overallMaxSpeed?: number;
  overallAvgSpeed?: number;
  totalFalls?: number;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  trackName,
  motorcycleName,
  laps,
  bestLapSeconds,
  overallMaxSpeed,
  overallAvgSpeed,
  totalFalls = 0,
}) => {
  if (!laps || laps.length === 0) {
    return (
      <div className="bg-racing-card border border-racing-border rounded-2xl p-8 text-center">
        <Gauge className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h4 className="font-display font-bold text-white text-base">Nenhuma Telemetria Registrada</h4>
        <p className="text-xs text-gray-400 mt-1">
          Os dados de voltas e sensores serão sincronizados após a conclusão da sessão na pista.
        </p>
      </div>
    );
  }

  // Encontrar melhor volta para destacar
  const bestLap = bestLapSeconds || Math.min(...laps.map((l) => l.lap_time_seconds));
  const maxSpeed = overallMaxSpeed || Math.max(...laps.map((l) => l.max_speed_kmh));

  const formatLapTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const remainingSec = (sec % 60).toFixed(3);
    return `${minutes}:${Number(remainingSec) < 10 ? '0' : ''}${remainingSec}`;
  };

  return (
    <div className="bg-racing-card border border-racing-border rounded-2xl p-6 shadow-2xl space-y-6">
      {/* HUD Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-racing-border gap-2">
        <div>
          <span className="text-[10px] font-display text-racing-cyan uppercase font-bold tracking-widest block">
            Telemetria de Pista • Race Log
          </span>
          <h3 className="text-lg font-display font-black text-white italic">
            {motorcycleName} @ {trackName}
          </h3>
        </div>
        <div className="flex gap-2">
          <span className="bg-racing-bg border border-racing-border text-xs px-3 py-1 rounded font-mono text-gray-300">
            Total de Voltas: <strong className="text-white">{laps.length}</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards Neon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-racing-bg p-3.5 rounded-xl border border-racing-border">
          <div className="flex items-center gap-1.5 text-xs text-racing-yellow font-display font-bold uppercase mb-1">
            <Trophy className="w-3.5 h-3.5" />
            Melhor Volta
          </div>
          <span className="font-mono font-black text-xl text-white">
            {formatLapTime(bestLap)}
          </span>
        </div>

        <div className="bg-racing-bg p-3.5 rounded-xl border border-racing-border">
          <div className="flex items-center gap-1.5 text-xs text-racing-cyan font-display font-bold uppercase mb-1">
            <Zap className="w-3.5 h-3.5" />
            Vel. Máxima
          </div>
          <span className="font-mono font-black text-xl text-white">
            {maxSpeed} <span className="text-xs text-gray-400">km/h</span>
          </span>
        </div>

        <div className="bg-racing-bg p-3.5 rounded-xl border border-racing-border">
          <div className="flex items-center gap-1.5 text-xs text-racing-green font-display font-bold uppercase mb-1">
            <Compass className="w-3.5 h-3.5" />
            Vel. Média
          </div>
          <span className="font-mono font-black text-xl text-white">
            {overallAvgSpeed || '---'} <span className="text-xs text-gray-400">km/h</span>
          </span>
        </div>

        <div className="bg-racing-bg p-3.5 rounded-xl border border-racing-border">
          <div className="flex items-center gap-1.5 text-xs text-racing-red font-display font-bold uppercase mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Quedas / Incidentes
          </div>
          <span className="font-mono font-black text-xl text-white">
            {totalFalls}
          </span>
        </div>
      </div>

      {/* Tabela de Voltas com Comparativo Gráfico */}
      <div>
        <h4 className="text-xs font-display font-bold uppercase text-gray-400 mb-3 tracking-wider">
          Registro Lap-by-Lap
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-racing-border text-gray-400 uppercase">
                <th className="py-2 px-3">Volta</th>
                <th className="py-2 px-3">Tempo</th>
                <th className="py-2 px-3">Vel. Máx</th>
                <th className="py-2 px-3">Vel. Média</th>
                <th className="py-2 px-3">Força G</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-racing-border/40">
              {laps.map((lap) => {
                const isBest = lap.lap_time_seconds === bestLap;
                return (
                  <tr
                    key={lap.lap_number}
                    className={`hover:bg-racing-bg/80 transition-colors ${
                      isBest ? 'bg-racing-yellow/10' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-white">
                      #{lap.lap_number}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={isBest ? 'text-racing-yellow font-black' : 'text-gray-200'}>
                        {formatLapTime(lap.lap_time_seconds)}
                      </span>
                      {isBest && (
                        <span className="ml-2 text-[10px] bg-racing-yellow text-racing-bg font-display font-black px-1.5 py-0.5 rounded uppercase">
                          BEST
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-racing-cyan font-bold">
                      {lap.max_speed_kmh} km/h
                    </td>
                    <td className="py-2.5 px-3 text-gray-300">
                      {lap.avg_speed_kmh} km/h
                    </td>
                    <td className="py-2.5 px-3 text-gray-300">
                      {lap.max_g_force} G
                    </td>
                    <td className="py-2.5 px-3">
                      {lap.falls_count > 0 ? (
                        <span className="text-racing-red font-bold">Queda</span>
                      ) : (
                        <span className="text-racing-green">Limpa</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
