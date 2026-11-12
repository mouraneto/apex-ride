'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useBooking, EquipmentSelectionData } from '@/context/BookingContext';
import { ShieldAlert, CheckCircle2, Clock, Calendar, Zap, AlertCircle } from 'lucide-react';

interface CatalogEquipment {
  id: string;
  name: string;
  category: 'HELMET' | 'SUIT' | 'GLOVES' | 'BOOTS';
  daily_price: number;
  available_sizes_list?: string[];
  available_sizes: string;
}

const FALLBACK_EQUIPMENTS: CatalogEquipment[] = [
  {
    id: 'eq-001',
    name: 'Capacete AGV K3 SV Racing',
    category: 'HELMET',
    daily_price: 50.0,
    available_sizes: '54,56,58,60',
    available_sizes_list: ['54', '56', '58', '60'],
  },
  {
    id: 'eq-002',
    name: 'Macacão Alpinestars GP Plus 1 Pça',
    category: 'SUIT',
    daily_price: 120.0,
    available_sizes: '48,50,52,54,56',
    available_sizes_list: ['48', '50', '52', '54', '56'],
  },
  {
    id: 'eq-003',
    name: 'Luvas Dainese Full Metal 6',
    category: 'GLOVES',
    daily_price: 35.0,
    available_sizes: 'S,M,L,XL',
    available_sizes_list: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'eq-004',
    name: 'Botas Sidi Rex Air',
    category: 'BOOTS',
    daily_price: 45.0,
    available_sizes: '39,40,41,42,43,44',
    available_sizes_list: ['39', '40', '41', '42', '43', '44'],
  },
];

const SPEED_MAP = {
  INICIANTE: 100,
  AMADOR: 160,
  INTERMEDIARIO: 220,
  AVANCADO: 280,
  PROFISSIONAL: 999,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedTrack, selectedMotorcycle, startTime, endTime, setBookingTimes } = useBooking();

  const [equipmentsCatalog, setEquipmentsCatalog] = useState<CatalogEquipment[]>(FALLBACK_EQUIPMENTS);
  const [selectedEPIs, setSelectedEPIs] = useState<{ [eqId: string]: { enabled: boolean; size: string } }>({
    'eq-001': { enabled: true, size: user?.helmet_size || '58' },
    'eq-002': { enabled: true, size: user?.suit_size || '52' },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallbacks caso o usuário entre direto em /checkout
  const track = selectedTrack || {
    id: 'tr-001',
    name: 'Autódromo José Carlos Pace (Interlagos)',
    location: 'São Paulo - SP',
    length_km: 4.3,
    hourly_rate: 250.0,
    image_url: '/images/tracks/interlagos.svg',
    is_active: true,
  };

  const bike = selectedMotorcycle || {
    id: 'mc-001',
    track_id: 'tr-001',
    brand: 'Ducati',
    model: 'Panigale V2',
    cc: 955,
    base_top_speed: 270,
    base_hourly_price: 450.0,
    image_url: '/images/bikes/panigale_v2.svg',
    status: 'AVAILABLE',
  };

  const pilotLevel = user?.pilot_level || 'INTERMEDIARIO';
  const effectiveSpeed = Math.min(bike.base_top_speed, SPEED_MAP[pilotLevel] || 220);

  useEffect(() => {
    const fetchEPIs = async () => {
      try {
        const res = await api.get<CatalogEquipment[]>('/equipments');
        if (res.data && res.data.length > 0) {
          setEquipmentsCatalog(res.data);
        }
      } catch (e) {
        // Fallback ativo
      }
    };
    fetchEPIs();
  }, []);

  // Cálculo financeiro client-side em tempo real
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const diffHours = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));

  const bikeCost = Number(bike.base_hourly_price) * diffHours;
  const trackCost = Number(track.hourly_rate) * diffHours;
  
  let epiCost = 0;
  Object.entries(selectedEPIs).forEach(([eqId, config]) => {
    if (config.enabled) {
      const eq = equipmentsCatalog.find((e) => e.id === eqId);
      if (eq) epiCost += Number(eq.daily_price);
    }
  });

  const insuranceFee = 75.0; // Fixo obrigatório
  const totalPrice = bikeCost + trackCost + epiCost + insuranceFee;

  const handleToggleEPI = (eqId: string, defaultSize: string) => {
    setSelectedEPIs((prev) => {
      const current = prev[eqId] || { enabled: false, size: defaultSize };
      return {
        ...prev,
        [eqId]: { ...current, enabled: !current.enabled },
      };
    });
  };

  const handleSizeChange = (eqId: string, size: string) => {
    setSelectedEPIs((prev) => ({
      ...prev,
      [eqId]: { enabled: true, size },
    }));
  };

  const handleConfirmReservation = async () => {
    if (!user) {
      router.push('/login?expired=true');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const equipmentsPayload = Object.entries(selectedEPIs)
        .filter(([_, config]) => config.enabled)
        .map(([eqId, config]) => ({
          equipment_id: eqId,
          chosen_size: config.size,
        }));

      // 1. Criar Reserva (PENDING)
      const rentalRes = await api.post('/rentals', {
        motorcycle_id: bike.id,
        track_id: track.id,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        equipments: equipmentsPayload,
      });

      const rentalId = rentalRes.data.rental_id;

      // 2. Checkout Mock (CONFIRMED + QR Code)
      await api.post('/payments/checkout', {
        rental_id: rentalId,
      });

      // 3. Redirecionar para Minha Garagem
      router.push('/my-garage');
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Erro ao processar reserva. Verifique horários ou conflito de pista.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 pb-6 border-b border-racing-border">
        <h1 className="text-3xl sm:text-4xl font-display font-black italic tracking-wide text-white uppercase">
          CHECKOUT & CONFIRMAÇÃO DE PISTA
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Revise horários, equipamentos de segurança obrigatórios e a trava de telemetria
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-racing-red/10 border border-racing-red/40 rounded-xl flex items-center gap-3 text-racing-red text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna 1 & 2: Veículo, Horário e EPIs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Veículo & Pista Selecionados */}
          <div className="bg-racing-card border border-racing-border rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-full sm:w-48 h-36 rounded-xl overflow-hidden bg-racing-bg border border-racing-border flex items-center justify-center">
              <Image
                src={bike.image_url || '/images/bikes/panigale_v2.svg'}
                alt={bike.model}
                fill
                className="object-contain p-2"
              />
            </div>
            <div className="space-y-2 text-center sm:text-left flex-1">
              <span className="text-xs font-display text-racing-cyan uppercase font-bold tracking-widest block">
                {bike.brand}
              </span>
              <h3 className="text-2xl font-display font-black text-white italic">
                {bike.model}
              </h3>
              <p className="text-xs text-gray-400">
                Circuito: <strong className="text-white">{track.name}</strong> ({track.location})
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="bg-racing-bg border border-racing-border text-xs px-2.5 py-1 rounded font-mono text-gray-300">
                  {bike.cc} CC
                </span>
                <span className="bg-racing-bg border border-racing-border text-xs px-2.5 py-1 rounded font-mono text-gray-300">
                  Velocidade Nominal: {bike.base_top_speed} km/h
                </span>
              </div>
            </div>
          </div>

          {/* Horário da Sessão */}
          <div className="bg-racing-card border border-racing-border rounded-2xl p-6 shadow-xl">
            <h3 className="font-display font-black text-base text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-racing-yellow" />
              Janela de Horário da Sessão
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-display text-gray-400 uppercase mb-1">
                  Início da Sessão
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setBookingTimes(e.target.value, endTime)}
                  className="w-full bg-racing-bg border border-racing-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-racing-yellow"
                />
              </div>
              <div>
                <label className="block text-xs font-display text-gray-400 uppercase mb-1">
                  Término da Sessão
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setBookingTimes(startTime, e.target.value)}
                  className="w-full bg-racing-bg border border-racing-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-racing-yellow"
                />
              </div>
            </div>
          </div>

          {/* Seletor de Equipamentos de Proteção */}
          <div className="bg-racing-card border border-racing-border rounded-2xl p-6 shadow-xl">
            <h3 className="font-display font-black text-base text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-racing-cyan" />
              Equipamentos de Proteção Individual (EPIs)
            </h3>
            <div className="space-y-3">
              {equipmentsCatalog.map((eq) => {
                const isSelected = !!selectedEPIs[eq.id]?.enabled;
                const sizes = eq.available_sizes_list || eq.available_sizes.split(',').map((s) => s.trim());
                const currentSize = selectedEPIs[eq.id]?.size || sizes[0];

                return (
                  <div
                    key={eq.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-racing-cyan bg-racing-cyan/5'
                        : 'border-racing-border bg-racing-bg'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleEPI(eq.id, currentSize)}
                        className="w-4 h-4 accent-racing-cyan cursor-pointer rounded"
                      />
                      <div>
                        <span className="text-sm font-bold text-white block">{eq.name}</span>
                        <span className="text-xs text-gray-400">R$ {Number(eq.daily_price).toFixed(2)} / diária</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono">Tamanho:</span>
                      <select
                        disabled={!isSelected}
                        value={currentSize}
                        onChange={(e) => handleSizeChange(eq.id, e.target.value)}
                        className="bg-racing-card border border-racing-border text-white text-xs rounded px-2 py-1 disabled:opacity-30"
                      >
                        {sizes.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coluna 3: Resumo Financeiro & Trava Eletrônica */}
        <div className="space-y-6">
          {/* Card de Trava de Velocidade */}
          <div className="bg-racing-card border-2 border-racing-red rounded-2xl p-6 shadow-neon-red relative overflow-hidden">
            <div className="flex items-center gap-2 text-racing-red mb-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h4 className="font-display font-black text-sm uppercase tracking-wider">
                TRAVA ELETRÔNICA ATIVA
              </h4>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Calibrada para o seu nível de piloto ({pilotLevel}):
            </p>
            <div className="bg-racing-bg p-4 rounded-xl border border-racing-border text-center">
              <span className="text-xs text-gray-500 font-mono uppercase block">Teto Permitido</span>
              <span className="font-display font-black text-3xl text-racing-red tracking-wider">
                {effectiveSpeed} KM/H
              </span>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="bg-racing-card border border-racing-border rounded-2xl p-6 shadow-2xl space-y-4">
            <h4 className="font-display font-black text-base text-white uppercase tracking-wider pb-3 border-b border-racing-border">
              Resumo Financeiro
            </h4>

            <div className="space-y-2 text-xs text-gray-300 font-mono">
              <div className="flex justify-between">
                <span>Moto ({diffHours}h):</span>
                <span className="text-white font-bold">R$ {bikeCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pista ({diffHours}h):</span>
                <span className="text-white font-bold">R$ {trackCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Equipamentos:</span>
                <span className="text-white font-bold">R$ {epiCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-racing-yellow">
                <span>Seguro Pista Obrigatório:</span>
                <span className="font-bold">R$ {insuranceFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-racing-border flex justify-between items-end">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-mono">
                  TOTAL A PAGAR
                </span>
                <span className="font-display font-black text-2xl text-racing-yellow">
                  R$ {totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleConfirmReservation}
              disabled={loading}
              className="w-full mt-4 py-4 bg-gradient-to-r from-racing-cyan to-blue-500 hover:from-racing-cyan/90 hover:to-blue-600 text-racing-bg font-display font-black italic tracking-widest uppercase rounded-xl shadow-neon-cyan transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? 'EMITINDO INGRESSO...' : 'CONFIRMAR E GERAR INGRESSO'}
            </button>
            <span className="text-[10px] text-gray-500 text-center block">
              Ambiente de pagamento seguro simulado (Mock Checkout)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
