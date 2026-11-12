'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar, Clock, MapPin, Download, QrCode } from 'lucide-react';

interface TicketProps {
  rentalUuid: string;
  trackName: string;
  motorcycleModel: string;
  dateStr: string;
  timeStr: string;
  speedLimit: number;
  qrCodeBase64?: string;
  pilotName: string;
}

export const TicketCard: React.FC<TicketProps> = ({
  rentalUuid,
  trackName,
  motorcycleModel,
  dateStr,
  timeStr,
  speedLimit,
  qrCodeBase64,
  pilotName,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-racing-card border-2 border-racing-cyan rounded-2xl p-6 shadow-neon-cyan max-w-md mx-auto text-white font-sans relative overflow-hidden print:border-black print:text-black print:shadow-none print:max-w-none">
      {/* Tarja Superior Arcade */}
      <div className="bg-racing-cyan text-racing-bg font-display font-black text-center py-1 text-xs uppercase tracking-widest rounded-t-lg -mx-6 -mt-6 mb-6 print:bg-black print:text-white">
        ApexRide Official Track Pass
      </div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] text-gray-400 block uppercase font-bold print:text-gray-700">
            Piloto Cadastrado
          </span>
          <h4 className="text-lg font-display font-bold text-racing-yellow print:text-black">
            {pilotName}
          </h4>
        </div>
        <span className="bg-racing-red/20 text-racing-red text-xs px-2.5 py-1 rounded font-bold border border-racing-red/40 print:border-black print:text-black">
          MAX {speedLimit} KM/H
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-300 mb-6 bg-racing-bg p-3.5 rounded-lg border border-racing-border print:bg-transparent print:border-black print:text-black">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-racing-cyan print:text-black" />
          <span className="font-medium">{trackName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-racing-cyan print:text-black" />
          <span>Data: {dateStr}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-racing-cyan print:text-black" />
          <span>Horário: {timeStr}</span>
        </div>
        <div className="text-xs pt-1 border-t border-racing-border/50 text-gray-400 print:text-gray-700">
          Veículo: <strong className="text-white print:text-black">{motorcycleModel}</strong>
        </div>
      </div>

      {/* Exibição do QR Code Centralizado */}
      <div className="text-center bg-white p-4 rounded-xl border-2 border-racing-cyan inline-block w-full my-2 print:border-black">
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
          {qrCodeBase64 ? (
            <Image
              src={qrCodeBase64}
              alt="QR Code da Reserva"
              fill
              className="object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <QrCode className="w-16 h-16 text-black" />
              <span className="text-xs text-black font-bold mt-2">QR Code Pendente</span>
            </div>
          )}
        </div>
        <span className="text-black font-mono text-[11px] font-bold block mt-2 tracking-wider">
          UUID: {rentalUuid.slice(0, 8)}...{rentalUuid.slice(-4)}
        </span>
      </div>

      <p className="text-[11px] text-gray-400 text-center my-3 print:text-gray-600">
        Apresente este QR Code na entrada do autódromo ao fiscal de pista.
      </p>

      <button
        onClick={handlePrint}
        className="w-full py-2.5 bg-racing-border hover:bg-gray-700 text-white font-display text-xs font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-2 no-print"
      >
        <Download className="w-4 h-4" />
        Baixar / Imprimir Ingresso PDF
      </button>
    </div>
  );
};
