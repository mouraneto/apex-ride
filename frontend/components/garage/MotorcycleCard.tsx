'use client';

import React from 'react';
import Image from 'next/image';
import { GaugeMeter } from '@/components/ui/GaugeMeter';
import { ShieldAlert, Zap } from 'lucide-react';

interface MotorcycleCardProps {
  id: string;
  brand: string;
  model: string;
  cc: number;
  baseTopSpeed: number;
  effectiveSpeedLimit: number;
  hourlyPrice: number;
  imageUrl?: string;
  onSelect: (id: string) => void;
}

export const MotorcycleCard: React.FC<MotorcycleCardProps> = ({
  id,
  brand,
  model,
  cc,
  baseTopSpeed,
  effectiveSpeedLimit,
  hourlyPrice,
  imageUrl,
  onSelect,
}) => {
  const isLimited = effectiveSpeedLimit < baseTopSpeed;

  return (
    <div className="bg-racing-card border border-racing-border hover:border-racing-cyan transition-all duration-300 rounded-xl p-5 shadow-2xl relative overflow-hidden group flex flex-col justify-between">
      {/* Glow Neon de fundo ao passar o mouse */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-racing-cyan/10 rounded-full blur-3xl group-hover:bg-racing-cyan/20 transition-all pointer-events-none" />

      <div>
        {/* Header com Marca e Preço */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-display uppercase tracking-widest text-racing-cyan font-bold block">
              {brand}
            </span>
            <h3 className="text-xl font-display font-extrabold italic text-white tracking-wide">
              {model}
            </h3>
            <span className="text-xs text-gray-400">{cc} CC • Superbike</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Locação / hora</span>
            <span className="text-xl font-display font-black text-racing-yellow">
              R$ {Number(hourlyPrice).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Imagem do Veículo */}
        <div className="relative h-48 w-full my-3 rounded-lg overflow-hidden bg-racing-bg border border-racing-border/50 flex items-center justify-center">
          <Image
            src={imageUrl || '/images/bikes/panigale_v2.svg'}
            alt={`${brand} ${model}`}
            fill
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Alerta de Trava Eletrônica */}
        {isLimited && (
          <div className="bg-racing-red/15 border border-racing-red/40 rounded-lg p-2.5 mb-3 flex items-center gap-2 text-racing-red text-xs font-bold">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Trava ativa em {effectiveSpeedLimit} km/h pelo seu nível</span>
          </div>
        )}

        {/* Barras de Status Arcade */}
        <div className="space-y-1 mb-4">
          <GaugeMeter
            label="Velocidade Liberada"
            value={effectiveSpeedLimit}
            maxValue={320}
            color={isLimited ? 'red' : 'cyan'}
            unit="km/h"
          />
          <GaugeMeter
            label="Velocidade Nominal Moto"
            value={baseTopSpeed}
            maxValue={320}
            color="yellow"
            unit="km/h"
          />
        </div>
      </div>

      {/* Botão Selecionar */}
      <button
        onClick={() => onSelect(id)}
        className="w-full py-3 bg-racing-cyan hover:bg-racing-cyan/90 text-racing-bg font-display font-extrabold italic uppercase rounded-lg shadow-neon-cyan transition-all flex items-center justify-center gap-2 text-sm mt-2"
      >
        <Zap className="w-4 h-4 fill-current" />
        ESCOLHER ESTA MOTO
      </button>
    </div>
  );
};
