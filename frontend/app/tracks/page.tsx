'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useBooking, TrackData } from '@/context/BookingContext';
import { TrackSelector } from '@/components/garage/TrackSelector';
import { Flag, ArrowRight, Sparkles } from 'lucide-react';

const FALLBACK_TRACKS: TrackData[] = [
  {
    id: 'tr-001',
    name: 'Autódromo José Carlos Pace (Interlagos)',
    location: 'São Paulo - SP',
    length_km: 4.3,
    hourly_rate: 250.0,
    image_url: '/images/tracks/interlagos.svg',
    is_active: true,
  },
  {
    id: 'tr-002',
    name: 'Autódromo Fazenda Capuava',
    location: 'Indaiatuba - SP',
    length_km: 2.7,
    hourly_rate: 180.0,
    image_url: '/images/tracks/capuava.svg',
    is_active: true,
  },
  {
    id: 'tr-003',
    name: 'Autódromo Internacional Velo Città',
    location: 'Mogi Guaçu - SP',
    length_km: 3.4,
    hourly_rate: 220.0,
    image_url: '/images/tracks/velocitta.svg',
    is_active: true,
  },
];

export default function TracksPage() {
  const router = useRouter();
  const { selectedTrack, setSelectedTrack } = useBooking();
  const [tracks, setTracks] = useState<TrackData[]>(FALLBACK_TRACKS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await api.get<TrackData[]>('/tracks');
        if (res.data && res.data.length > 0) {
          setTracks(res.data);
        }
      } catch (err) {
        // Fallback para os dados conhecidos
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, []);

  const handleSelectTrack = (track: TrackData) => {
    setSelectedTrack(track);
  };

  const handleProceed = () => {
    if (selectedTrack) {
      router.push('/garage');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header estilo Mapa de Fases Arcade */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 pb-6 border-b border-racing-border gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-display text-racing-cyan font-bold tracking-widest uppercase mb-2">
            <Flag className="w-3.5 h-3.5 text-racing-cyan" />
            FASE 1: CIRCUITO OFICIAL
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black italic tracking-wide text-white uppercase">
            SELEÇÃO DE AUTÓDROMO
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Escolha o circuito onde você quer acelerar para desbloquear a frota disponível
          </p>
        </div>

        {selectedTrack && (
          <button
            onClick={handleProceed}
            className="px-6 py-3 rounded-xl bg-racing-cyan hover:bg-racing-cyan/90 text-racing-bg font-display font-black italic tracking-widest text-xs uppercase shadow-neon-cyan transition-all flex items-center gap-2"
          >
            AVANÇAR PARA A GARAGEM
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Grid de Pistas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tracks.map((track) => (
          <TrackSelector
            key={track.id}
            track={track}
            isSelected={selectedTrack?.id === track.id}
            onSelect={handleSelectTrack}
          />
        ))}
      </div>

      {/* CTA Inferior se selecionado */}
      {selectedTrack && (
        <div className="mt-12 p-6 bg-racing-card border border-racing-cyan/40 rounded-2xl shadow-neon-cyan flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-racing-cyan shrink-0" />
            <div>
              <span className="text-xs text-gray-400 uppercase block">Circuito Escolhido</span>
              <h4 className="font-display font-bold text-white text-lg">{selectedTrack.name}</h4>
            </div>
          </div>
          <button
            onClick={handleProceed}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-racing-cyan to-blue-500 text-racing-bg font-display font-black italic tracking-widest text-sm uppercase shadow-neon-cyan transition-all flex items-center justify-center gap-2"
          >
            ESCOLHER MOTOCICLETA NESTE CIRCUITO
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
