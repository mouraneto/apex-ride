'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin, Navigation, Flag } from 'lucide-react';
import { TrackData } from '@/context/BookingContext';

interface TrackSelectorProps {
  track: TrackData;
  isSelected: boolean;
  onSelect: (track: TrackData) => void;
}

export const TrackSelector: React.FC<TrackSelectorProps> = ({
  track,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(track)}
      className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 bg-racing-card p-5 relative group ${
        isSelected
          ? 'border-racing-cyan shadow-neon-cyan scale-[1.02]'
          : 'border-racing-border hover:border-gray-600'
      }`}
    >
      <div className="relative h-48 w-full rounded-xl overflow-hidden mb-4 bg-racing-bg border border-racing-border flex items-center justify-center">
        <Image
          src={track.image_url || '/images/tracks/interlagos.svg'}
          alt={track.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isSelected && (
          <div className="absolute top-3 right-3 bg-racing-cyan text-racing-bg font-display font-black text-[10px] px-2.5 py-1 rounded shadow-neon-cyan uppercase">
            SELECIONADO
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-display font-black text-lg text-white group-hover:text-racing-cyan transition-colors">
          {track.name}
        </h3>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <MapPin className="w-3.5 h-3.5 text-racing-cyan" />
          <span>{track.location}</span>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-racing-border text-xs">
          <div className="flex items-center gap-1.5 text-gray-300">
            <Navigation className="w-3.5 h-3.5 text-racing-yellow" />
            <span>Extensão: <strong className="text-white">{track.length_km} km</strong></span>
          </div>
          <div className="text-right">
            <span className="text-gray-400 block text-[10px] uppercase">Taxa de Pista</span>
            <span className="font-display font-bold text-racing-yellow text-sm">
              R$ {Number(track.hourly_rate).toFixed(2)}/h
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
