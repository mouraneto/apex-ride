'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { TicketCard } from '@/components/ui/TicketCard';
import { TelemetryChart, LapTelemetry } from '@/components/ui/TelemetryChart';
import { PilotBadge } from '@/components/ui/PilotBadge';
import { Ticket, Activity, PlusCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface RentalItem {
  rental_id: string;
  rental_uuid: string;
  motorcycle_id: string;
  motorcycle_name: string;
  track_id: string;
  track_name: string;
  start_time: string;
  end_time: string;
  effective_speed_limit: number;
  total_price: number;
  status: string;
  qr_code_base64?: string;
}

interface TelemetryData {
  rental_id: string;
  rental_uuid: string;
  track_name: string;
  motorcycle_name: string;
  laps: LapTelemetry[];
  best_lap_seconds?: number;
  overall_max_speed?: number;
  overall_avg_speed?: number;
  total_falls?: number;
}

export default function MyGaragePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'tickets' | 'telemetry'>('tickets');
  const [rentals, setRentals] = useState<RentalItem[]>([]);
  const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyGarage = async () => {
    setLoading(true);
    try {
      const res = await api.get<RentalItem[]>('/rentals/my-garage');
      setRentals(res.data);
      if (res.data.length > 0 && !selectedRentalId) {
        setSelectedRentalId(res.data[0].rental_id);
      }
    } catch (err: any) {
      setError('Faça login para visualizar sua garagem de ingressos e telemetria.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGarage();
  }, []);

  const fetchTelemetry = async (rentalId: string) => {
    try {
      const res = await api.get<TelemetryData>(`/telemetry/rental/${rentalId}`);
      setTelemetry(res.data);
    } catch {
      setTelemetry(null);
    }
  };

  useEffect(() => {
    if (selectedRentalId && activeTab === 'telemetry') {
      fetchTelemetry(selectedRentalId);
    }
  }, [selectedRentalId, activeTab]);

  const handleSimulateTelemetry = async (rentalId: string) => {
    setActionLoading(true);
    try {
      // Chama o mock session do operador
      await api.post('/telemetry/mock-session', {
        rental_id: rentalId,
        laps_count: 5,
      });
      await fetchTelemetry(rentalId);
      await fetchMyGarage();
    } catch (err: any) {
      // Se não for operador, gera mock localmente para demonstração na UI
      setTelemetry({
        rental_id: rentalId,
        rental_uuid: 'simulated-uuid',
        track_name: 'Autódromo de Interlagos',
        motorcycle_name: 'Ducati Panigale V2',
        laps: [
          { lap_number: 1, lap_time_seconds: 104.25, max_speed_kmh: 215, avg_speed_kmh: 148, max_g_force: 1.35, falls_count: 0 },
          { lap_number: 2, lap_time_seconds: 101.89, max_speed_kmh: 220, avg_speed_kmh: 154, max_g_force: 1.48, falls_count: 0 },
          { lap_number: 3, lap_time_seconds: 99.42, max_speed_kmh: 220, avg_speed_kmh: 159, max_g_force: 1.55, falls_count: 0 },
          { lap_number: 4, lap_time_seconds: 100.12, max_speed_kmh: 218, avg_speed_kmh: 157, max_g_force: 1.42, falls_count: 0 },
          { lap_number: 5, lap_time_seconds: 98.74, max_speed_kmh: 220, avg_speed_kmh: 162, max_g_force: 1.62, falls_count: 0 },
        ],
        best_lap_seconds: 98.74,
        overall_max_speed: 220,
        overall_avg_speed: 156,
        total_falls: 0,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const selectedRental = rentals.find((r) => r.rental_id === selectedRentalId) || rentals[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header da Garagem */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 pb-6 border-b border-racing-border gap-4 no-print">
        <div>
          <span className="text-xs font-display text-racing-cyan uppercase font-bold tracking-widest block mb-1">
            Painel do Piloto • Telemetry Hub
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-black italic tracking-wide text-white uppercase">
            MINHA GARAGEM & INGRESSOS
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {user && <PilotBadge level={user.pilot_level} />}
          <Link
            href="/tracks"
            className="px-4 py-2.5 rounded-xl bg-racing-cyan text-racing-bg font-display font-black text-xs tracking-wider uppercase shadow-neon-cyan hover:bg-racing-cyan/90 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            NOVA RESERVA
          </Link>
        </div>
      </div>

      {error ? (
        <div className="p-8 bg-racing-card border border-racing-border rounded-2xl text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-racing-yellow mx-auto" />
          <h3 className="font-display font-bold text-lg text-white">{error}</h3>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 rounded-lg bg-racing-cyan text-racing-bg font-display font-bold text-xs uppercase"
          >
            Fazer Login
          </Link>
        </div>
      ) : rentals.length === 0 && !loading ? (
        <div className="p-12 bg-racing-card border border-racing-border rounded-2xl text-center space-y-4">
          <Ticket className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="font-display font-bold text-xl text-white">Nenhuma Reserva Encontrada</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Você ainda não alugou uma superbike. Acesse o catálogo de pistas e monte sua primeira sessão de track day.
          </p>
          <Link
            href="/tracks"
            className="inline-block px-8 py-3.5 rounded-xl bg-racing-cyan text-racing-bg font-display font-black text-xs uppercase shadow-neon-cyan hover:bg-racing-cyan/90 transition-all"
          >
            ESCOLHER CIRCUITO E MOTO
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Navegação de Abas */}
          <div className="flex gap-4 border-b border-racing-border no-print">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`pb-3 font-display text-sm font-bold tracking-wider flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'tickets'
                  ? 'border-racing-cyan text-racing-cyan shadow-neon-cyan'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Ticket className="w-4 h-4" />
              INGRESSOS COM QR CODE ({rentals.length})
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`pb-3 font-display text-sm font-bold tracking-wider flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'telemetry'
                  ? 'border-racing-yellow text-racing-yellow shadow-neon-yellow'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              TELEMETRIA PÓS-CORRIDA
            </button>
          </div>

          {/* Seletor da Reserva Ativa caso tenha mais de 1 */}
          {rentals.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 no-print">
              {rentals.map((r) => (
                <button
                  key={r.rental_id}
                  onClick={() => setSelectedRentalId(r.rental_id)}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-bold whitespace-nowrap border transition-all ${
                    selectedRentalId === r.rental_id
                      ? 'border-racing-cyan bg-racing-cyan/10 text-racing-cyan'
                      : 'border-racing-border bg-racing-card text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {r.motorcycle_name} @ {r.track_name.split(' ')[0]} ({r.status})
                </button>
              ))}
            </div>
          )}

          {/* Conteúdo da Aba Ingressos */}
          {activeTab === 'tickets' && selectedRental && (
            <div>
              <TicketCard
                rentalUuid={selectedRental.rental_uuid}
                trackName={selectedRental.track_name}
                motorcycleModel={selectedRental.motorcycle_name}
                dateStr={new Date(selectedRental.start_time).toLocaleDateString('pt-BR')}
                timeStr={`${new Date(selectedRental.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedRental.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                speedLimit={selectedRental.effective_speed_limit}
                qrCodeBase64={selectedRental.qr_code_base64}
                pilotName={user?.name || 'Piloto ApexRide'}
              />
            </div>
          )}

          {/* Conteúdo da Aba Telemetria */}
          {activeTab === 'telemetry' && selectedRental && (
            <div className="space-y-6">
              <div className="flex justify-end no-print">
                <button
                  onClick={() => handleSimulateTelemetry(selectedRental.rental_id)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-racing-card border border-racing-yellow text-racing-yellow text-xs font-display font-bold hover:bg-racing-yellow/10 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                  {actionLoading ? 'SIMULANDO...' : 'SIMULAR SESSÃO DE TELEMETRIA'}
                </button>
              </div>

              {telemetry ? (
                <TelemetryChart
                  trackName={telemetry.track_name}
                  motorcycleName={telemetry.motorcycle_name}
                  laps={telemetry.laps}
                  bestLapSeconds={telemetry.best_lap_seconds}
                  overallMaxSpeed={telemetry.overall_max_speed}
                  overallAvgSpeed={telemetry.overall_avg_speed}
                  totalFalls={telemetry.total_falls}
                />
              ) : (
                <div className="bg-racing-card border border-racing-border rounded-2xl p-8 text-center space-y-4">
                  <Activity className="w-12 h-12 text-gray-600 mx-auto" />
                  <h4 className="font-display font-bold text-white text-base">Sessão em Espera</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    A telemetria é carregada assim que a corrida for validada e finalizada pelo fiscal de pista.
                  </p>
                  <button
                    onClick={() => handleSimulateTelemetry(selectedRental.rental_id)}
                    className="px-6 py-2.5 rounded-lg bg-racing-yellow text-racing-bg font-display font-black text-xs uppercase"
                  >
                    Gerar Dados de Teste
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
