'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useBooking, MotorcycleData } from '@/context/BookingContext';
import { MotorcycleCard } from '@/components/garage/MotorcycleCard';
import { PilotBadge } from '@/components/ui/PilotBadge';
import { Wrench, ArrowLeft, ShieldAlert } from 'lucide-react';

const SPEED_MAP = {
  INICIANTE: 100,
  AMADOR: 160,
  INTERMEDIARIO: 220,
  AVANCADO: 280,
  PROFISSIONAL: 999,
};

const FALLBACK_BIKES: MotorcycleData[] = [
  {
    id: 'mc-001',
    track_id: 'tr-001',
    brand: 'Ducati',
    model: 'Panigale V2',
    cc: 955,
    base_top_speed: 270,
    base_hourly_price: 450.0,
    image_url: '/images/bikes/panigale_v2.svg',
    status: 'AVAILABLE',
  },
  {
    id: 'mc-002',
    track_id: 'tr-001',
    brand: 'Suzuki',
    model: 'GSX-R750',
    cc: 750,
    base_top_speed: 280,
    base_hourly_price: 380.0,
    image_url: '/images/bikes/gsxr750.svg',
    status: 'AVAILABLE',
  },
  {
    id: 'mc-003',
    track_id: 'tr-002',
    brand: 'Kawasaki',
    model: 'Ninja ZX-6R',
    cc: 636,
    base_top_speed: 260,
    base_hourly_price: 320.0,
    image_url: '/images/bikes/zx6r.svg',
    status: 'AVAILABLE',
  },
  {
    id: 'mc-004',
    track_id: 'tr-002',
    brand: 'Honda',
    model: 'CB 650R Racing',
    cc: 649,
    base_top_speed: 220,
    base_hourly_price: 250.0,
    image_url: '/images/bikes/cb650r.svg',
    status: 'AVAILABLE',
  },
  {
    id: 'mc-005',
    track_id: 'tr-003',
    brand: 'Yamaha',
    model: 'YZF-R6',
    cc: 599,
    base_top_speed: 265,
    base_hourly_price: 340.0,
    image_url: '/images/bikes/r6.svg',
    status: 'AVAILABLE',
  },
  {
    id: 'mc-006',
    track_id: 'tr-003',
    brand: 'BMW',
    model: 'S1000RR Track Edition',
    cc: 999,
    base_top_speed: 305,
    base_hourly_price: 550.0,
    image_url: '/images/bikes/s1000rr.svg',
    status: 'AVAILABLE',
  },
];

export default function GaragePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedTrack, setSelectedMotorcycle } = useBooking();

  const [motorcycles, setMotorcycles] = useState<MotorcycleData[]>(FALLBACK_BIKES);
  const [loading, setLoading] = useState(true);

  const pilotLevel = user?.pilot_level || 'INTERMEDIARIO';
  const pilotMaxSpeed = SPEED_MAP[pilotLevel] || 220;

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        const endpoint = selectedTrack
          ? `/tracks/${selectedTrack.id}/motorcycles`
          : '/motorcycles';
        const res = await api.get<MotorcycleData[]>(endpoint);
        if (res.data && res.data.length > 0) {
          setMotorcycles(res.data);
        } else if (selectedTrack) {
          setMotorcycles(FALLBACK_BIKES.filter((b) => b.track_id === selectedTrack.id));
        }
      } catch (err) {
        if (selectedTrack) {
          setMotorcycles(FALLBACK_BIKES.filter((b) => b.track_id === selectedTrack.id));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBikes();
  }, [selectedTrack]);

  const handleSelectBike = (bikeId: string) => {
    const bike = motorcycles.find((b) => b.id === bikeId) || null;
    setSelectedMotorcycle(bike);
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header com HUD do Piloto */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 pb-6 border-b border-racing-border gap-4">
        <div>
          <button
            onClick={() => router.push('/tracks')}
            className="inline-flex items-center gap-1.5 text-xs font-display text-gray-400 hover:text-racing-cyan transition-colors mb-2 uppercase"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Alterar Circuito {selectedTrack && `(${selectedTrack.name})`}
          </button>
          <h1 className="text-3xl sm:text-4xl font-display font-black italic tracking-wide text-white uppercase">
            GARAGEM DE SUPERBIKES
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Compare atributos, telemetria base e a velocidade liberada para seu nível de piloto
          </p>
        </div>

        <div className="bg-racing-card border border-racing-border px-4 py-2.5 rounded-xl text-right">
          <span className="text-[10px] text-gray-400 uppercase font-mono block">Piloto Homologado</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-bold text-white">{user?.name || 'Piloto Visitante'}</span>
            <PilotBadge level={pilotLevel} />
          </div>
        </div>
      </div>

      {/* Grid de Motos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {motorcycles.map((bike) => {
          const effectiveSpeed = Math.min(bike.base_top_speed, pilotMaxSpeed);
          return (
            <MotorcycleCard
              key={bike.id}
              id={bike.id}
              brand={bike.brand}
              model={bike.model}
              cc={bike.cc}
              baseTopSpeed={bike.base_top_speed}
              effectiveSpeedLimit={effectiveSpeed}
              hourlyPrice={Number(bike.base_hourly_price)}
              imageUrl={bike.image_url}
              onSelect={handleSelectBike}
            />
          );
        })}
      </div>
    </div>
  );
}
