'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Trophy, Medal, Zap, Gauge, Filter } from 'lucide-react';

interface LeaderboardItem {
  rank: number;
  pilot_name: string;
  pilot_level: string;
  track_name: string;
  motorcycle_model: string;
  best_lap_time: number;
  max_speed_kmh: number;
  avg_speed_kmh: number;
  max_g_force: number;
}

const FALLBACK_LEADERBOARD: LeaderboardItem[] = [
  {
    rank: 1,
    pilot_name: 'Alex Barros',
    pilot_level: 'PROFISSIONAL',
    track_name: 'Autódromo de Interlagos',
    motorcycle_model: 'Ducati Panigale V2',
    best_lap_time: 94.312,
    max_speed_kmh: 270.0,
    avg_speed_kmh: 172.4,
    max_g_force: 1.68,
  },
  {
    rank: 2,
    pilot_name: 'João Neto',
    pilot_level: 'INTERMEDIARIO',
    track_name: 'Autódromo Fazenda Capuava',
    motorcycle_model: 'Suzuki GSX-R750',
    best_lap_time: 97.458,
    max_speed_kmh: 220.0,
    avg_speed_kmh: 161.2,
    max_g_force: 1.54,
  },
  {
    rank: 3,
    pilot_name: 'Eric Granado',
    pilot_level: 'PROFISSIONAL',
    track_name: 'Autódromo Internacional Velo Città',
    motorcycle_model: 'BMW S1000RR Track Edition',
    best_lap_time: 98.125,
    max_speed_kmh: 295.0,
    avg_speed_kmh: 168.0,
    max_g_force: 1.62,
  },
  {
    rank: 4,
    pilot_name: 'Lucas Paschoalin',
    pilot_level: 'AVANCADO',
    track_name: 'Autódromo de Interlagos',
    motorcycle_model: 'Yamaha YZF-R6',
    best_lap_time: 101.24,
    max_speed_kmh: 260.0,
    avg_speed_kmh: 153.8,
    max_g_force: 1.45,
  },
  {
    rank: 5,
    pilot_name: 'Matheus Barbosa',
    pilot_level: 'AMADOR',
    track_name: 'Autódromo Fazenda Capuava',
    motorcycle_model: 'Kawasaki Ninja ZX-6R',
    best_lap_time: 104.88,
    max_speed_kmh: 160.0,
    avg_speed_kmh: 141.0,
    max_g_force: 1.32,
  },
];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>(FALLBACK_LEADERBOARD);
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get<LeaderboardItem[]>('/telemetry/leaderboard');
        if (res.data && res.data.length > 0) {
          setLeaderboard(res.data);
        }
      } catch {
        // Usa o fallback
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const formatLapTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const remainingSec = (sec % 60).toFixed(3);
    return `${minutes}:${Number(remainingSec) < 10 ? '0' : ''}${remainingSec}`;
  };

  const filteredItems = leaderboard.filter((item) => {
    if (selectedTrackFilter === 'ALL') return true;
    return item.track_name.toLowerCase().includes(selectedTrackFilter.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Arcade Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-racing-yellow/10 border border-racing-yellow/40 text-racing-yellow text-xs font-display font-black tracking-widest shadow-neon-yellow mb-4 uppercase">
          <Trophy className="w-4 h-4" />
          HALL DA FAMA • TEMPORADA 2026
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-black italic tracking-wider text-white uppercase">
          ARCADE LEADERBOARD
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-2">
          Classificação geral dos pilotos mais rápidos e com maior aceleração lateral
        </p>
      </div>

      {/* Podio Top 3 Neon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
        {/* Prata: 2º Lugar */}
        {leaderboard[1] && (
          <div className="bg-racing-card border-2 border-slate-400 rounded-2xl p-6 text-center order-2 md:order-1 relative overflow-hidden">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center text-slate-200 font-display font-black text-xl mb-3 shadow-[0_0_15px_rgba(148,163,184,0.3)]">
              2
            </div>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Prata</span>
            <h3 className="font-display font-bold text-white text-lg mt-1">{leaderboard[1].pilot_name}</h3>
            <span className="text-xs text-gray-400 block">{leaderboard[1].motorcycle_model}</span>
            <div className="mt-4 pt-4 border-t border-racing-border">
              <span className="text-[10px] text-gray-400 uppercase block">Tempo de Volta</span>
              <span className="font-mono font-black text-xl text-slate-300">
                {formatLapTime(leaderboard[1].best_lap_time)}
              </span>
            </div>
          </div>
        )}

        {/* Ouro: 1º Lugar */}
        {leaderboard[0] && (
          <div className="bg-racing-card border-2 border-racing-yellow rounded-2xl p-8 text-center order-1 md:order-2 shadow-neon-yellow relative overflow-hidden scale-105">
            <div className="w-14 h-14 mx-auto rounded-full bg-yellow-950/80 border-2 border-racing-yellow flex items-center justify-center text-racing-yellow font-display font-black text-2xl mb-3">
              <Trophy className="w-7 h-7" />
            </div>
            <span className="text-xs text-racing-yellow font-display font-black uppercase tracking-widest block">
              CAMPEÃO DO CIRCUITO
            </span>
            <h2 className="font-display font-black text-2xl text-white italic mt-1">{leaderboard[0].pilot_name}</h2>
            <span className="text-xs text-gray-300 block">{leaderboard[0].motorcycle_model}</span>
            <div className="mt-4 pt-4 border-t border-racing-border">
              <span className="text-[10px] text-gray-400 uppercase block font-mono">Recorde Absoluto</span>
              <span className="font-mono font-black text-3xl text-racing-yellow">
                {formatLapTime(leaderboard[0].best_lap_time)}
              </span>
              <div className="mt-2 text-xs font-mono text-gray-400">
                Top Speed: <strong className="text-racing-cyan">{leaderboard[0].max_speed_kmh} km/h</strong>
              </div>
            </div>
          </div>
        )}

        {/* Bronze: 3º Lugar */}
        {leaderboard[2] && (
          <div className="bg-racing-card border-2 border-amber-700 rounded-2xl p-6 text-center order-3 relative overflow-hidden">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-950/80 border-2 border-amber-700 flex items-center justify-center text-amber-500 font-display font-black text-xl mb-3 shadow-[0_0_15px_rgba(180,83,9,0.3)]">
              3
            </div>
            <span className="text-[10px] text-amber-600 font-mono uppercase block">Bronze</span>
            <h3 className="font-display font-bold text-white text-lg mt-1">{leaderboard[2].pilot_name}</h3>
            <span className="text-xs text-gray-400 block">{leaderboard[2].motorcycle_model}</span>
            <div className="mt-4 pt-4 border-t border-racing-border">
              <span className="text-[10px] text-gray-400 uppercase block">Tempo de Volta</span>
              <span className="font-mono font-black text-xl text-amber-400">
                {formatLapTime(leaderboard[2].best_lap_time)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filtro por Pista */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-display">
          <Filter className="w-4 h-4 text-racing-cyan" />
          <span>FILTRAR POR CIRCUITO:</span>
        </div>
        <div className="flex gap-2">
          {['ALL', 'Interlagos', 'Capuava', 'Velo Città'].map((track) => (
            <button
              key={track}
              onClick={() => setSelectedTrackFilter(track)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold uppercase transition-all ${
                selectedTrackFilter === track
                  ? 'bg-racing-cyan text-racing-bg shadow-neon-cyan'
                  : 'bg-racing-card border border-racing-border text-gray-400 hover:text-white'
              }`}
            >
              {track === 'ALL' ? 'TODOS' : track}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela do Placar */}
      <div className="bg-racing-card border border-racing-border rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-racing-bg/80 border-b border-racing-border text-gray-400 font-display uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">POS</th>
                <th className="py-3 px-4">Piloto</th>
                <th className="py-3 px-4">Nível</th>
                <th className="py-3 px-4">Superbike</th>
                <th className="py-3 px-4">Circuito</th>
                <th className="py-3 px-4 text-right">Melhor Volta</th>
                <th className="py-3 px-4 text-right">Top Speed</th>
                <th className="py-3 px-4 text-right">Força G</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-racing-border/40">
              {filteredItems.map((item) => (
                <tr key={`${item.rank}-${item.pilot_name}`} className="hover:bg-racing-bg/60 transition-colors">
                  <td className="py-3.5 px-4 font-display font-black text-sm">
                    {item.rank === 1 ? (
                      <span className="text-racing-yellow">01</span>
                    ) : item.rank === 2 ? (
                      <span className="text-slate-300">02</span>
                    ) : item.rank === 3 ? (
                      <span className="text-amber-500">03</span>
                    ) : (
                      <span className="text-gray-500">{item.rank < 10 ? `0${item.rank}` : item.rank}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white text-sm">
                    {item.pilot_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-racing-border bg-racing-bg text-gray-300">
                      {item.pilot_level}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-200">
                    {item.motorcycle_model}
                  </td>
                  <td className="py-3.5 px-4 text-gray-400">
                    {item.track_name}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-racing-yellow text-sm">
                    {formatLapTime(item.best_lap_time)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-racing-cyan font-bold">
                    {item.max_speed_kmh} km/h
                  </td>
                  <td className="py-3.5 px-4 text-right text-gray-300">
                    {item.max_g_force} G
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
