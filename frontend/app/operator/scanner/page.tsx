'use client';

import React, { useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  ShieldAlert,
  QrCode,
  Heart,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  Search,
} from 'lucide-react';

interface MedicalRecord {
  pilot_name: string;
  emergency_contact: string;
  blood_type: string;
  sus_card?: string;
  cnh_number?: string;
}

interface ValidateQRResult {
  valid: boolean;
  status: string;
  rental_uuid: string;
  track_name: string;
  motorcycle_model: string;
  effective_speed_limit: number;
  start_time: string;
  end_time: string;
  medical_record: MedicalRecord;
}

export default function OperatorScannerPage() {
  const { user } = useAuth();
  const [uuidInput, setUuidInput] = useState('');
  const [result, setResult] = useState<ValidateQRResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uuidInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post<ValidateQRResult>('/operator/validate-qr', {
        rental_uuid: uuidInput.trim(),
      });
      setResult(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          'Código inválido, reserva inexistente ou acesso restrito a operadores.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isOperator = user?.role === 'OPERATOR';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Scanner Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-racing-red/10 border border-racing-red/40 text-racing-red text-xs font-display font-black tracking-widest shadow-neon-red mb-3 uppercase">
          <ShieldCheck className="w-4 h-4" />
          TERMINAL DE HOMOLOGAÇÃO DE PISTA
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black italic tracking-wide text-white uppercase">
          SCANNER DO OPERADOR & RESGATE
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Validação do QR Code do piloto e liberação instantânea da Ficha Médica
        </p>
      </div>

      {!isOperator && (
        <div className="mb-8 p-4 bg-racing-yellow/10 border border-racing-yellow/40 rounded-xl flex items-center gap-3 text-racing-yellow text-xs">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>
            Atenção: Você está visualizando em modo de demonstração. Em produção, este terminal requer permissão de OPERADOR.
          </span>
        </div>
      )}

      {/* Input de UUID ou Scan */}
      <div className="bg-racing-card border-2 border-racing-border rounded-2xl p-6 shadow-2xl mb-8">
        <form onSubmit={handleValidate} className="space-y-4">
          <label className="block text-xs font-display font-bold text-gray-300 uppercase">
            Identificador UUID do Ingresso (QR Code)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <QrCode className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={uuidInput}
                onChange={(e) => setUuidInput(e.target.value)}
                placeholder="Ex: f47ac10b-58cc-4372-a567-0e02b2c3d479"
                className="w-full bg-racing-bg border border-racing-border rounded-lg pl-10 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-racing-cyan"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-racing-cyan hover:bg-racing-cyan/90 text-racing-bg font-display font-black text-xs uppercase shadow-neon-cyan transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              {loading ? 'VALIDANDO...' : 'CONSULTAR'}
            </button>
          </div>
        </form>
      </div>

      {/* Alerta de Erro (Red Card) */}
      {error && (
        <div className="bg-racing-red/10 border-2 border-racing-red rounded-2xl p-6 shadow-neon-red text-center space-y-3">
          <XCircle className="w-12 h-12 text-racing-red mx-auto" />
          <h3 className="font-display font-black text-xl text-white uppercase italic">
            ACESSO NÃO AUTORIZADO / QR INVÁLIDO
          </h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto">{error}</p>
        </div>
      )}

      {/* Resultado Válido (Green Card + Ficha Médica) */}
      {result && (
        <div className="space-y-6">
          {/* Card Verde de Entrada Autorizada */}
          <div className="bg-racing-card border-2 border-racing-green rounded-2xl p-6 shadow-[0_0_20px_rgba(0,255,102,0.3)] relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-racing-border">
              <div className="flex items-center gap-2 text-racing-green">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <h3 className="font-display font-black text-lg text-white uppercase italic">
                  ACESSO À PISTA LIBERADO
                </h3>
              </div>
              <span className="bg-racing-green/20 text-racing-green font-display font-bold text-xs px-3 py-1 rounded border border-racing-green/40 uppercase">
                {result.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 text-xs font-mono">
              <div>
                <span className="text-gray-400 block">Piloto:</span>
                <span className="font-display font-bold text-white text-base">
                  {result.medical_record.pilot_name}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Superbike:</span>
                <span className="font-display font-bold text-racing-cyan text-base">
                  {result.motorcycle_model}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Circuito:</span>
                <span className="text-gray-200">{result.track_name}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Trava Eletrônica Liberada:</span>
                <span className="font-display font-black text-racing-red text-base">
                  MAX {result.effective_speed_limit} KM/H
                </span>
              </div>
            </div>
          </div>

          {/* Ficha Médica de Emergência (LGPD Protegida) */}
          <div className="bg-racing-card border-2 border-racing-red rounded-2xl p-6 shadow-neon-red">
            <div className="flex items-center gap-2 pb-3 border-b border-racing-border text-racing-red mb-4">
              <Heart className="w-5 h-5 shrink-0" />
              <h4 className="font-display font-black text-base uppercase tracking-wider text-white">
                FICHA MÉDICA DE RESGATE & EMERGÊNCIA
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-racing-bg p-3.5 rounded-xl border border-racing-border">
                <span className="text-gray-400 block text-[10px] uppercase">Tipo Sanguíneo</span>
                <span className="font-display font-black text-2xl text-racing-red">
                  {result.medical_record.blood_type}
                </span>
              </div>

              <div className="bg-racing-bg p-3.5 rounded-xl border border-racing-border">
                <span className="text-gray-400 block text-[10px] uppercase">Contato de Emergência</span>
                <div className="flex items-center gap-1.5 mt-1 text-white font-bold text-sm">
                  <Phone className="w-4 h-4 text-racing-green" />
                  <span>{result.medical_record.emergency_contact}</span>
                </div>
              </div>

              <div className="bg-racing-bg p-3.5 rounded-xl border border-racing-border">
                <span className="text-gray-400 block text-[10px] uppercase">Cartão Nacional do SUS</span>
                <span className="text-gray-200 font-bold mt-1 block">
                  {result.medical_record.sus_card || 'Não Informado'}
                </span>
              </div>

              <div className="bg-racing-bg p-3.5 rounded-xl border border-racing-border">
                <span className="text-gray-400 block text-[10px] uppercase">Número da CNH</span>
                <span className="text-gray-200 font-bold mt-1 block">
                  {result.medical_record.cnh_number || 'Não Informada'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
