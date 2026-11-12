'use client';

import React, { createContext, useContext, useState } from 'react';

export interface TrackData {
  id: string;
  name: string;
  location: string;
  length_km: number;
  hourly_rate: number;
  image_url?: string;
  is_active: boolean;
}

export interface MotorcycleData {
  id: string;
  track_id: string;
  brand: string;
  model: string;
  cc: number;
  base_top_speed: number;
  base_hourly_price: number;
  image_url?: string;
  status: string;
}

export interface EquipmentSelectionData {
  equipment_id: string;
  name: string;
  chosen_size: string;
  daily_price: number;
}

interface BookingContextType {
  selectedTrack: TrackData | null;
  selectedMotorcycle: MotorcycleData | null;
  selectedEquipments: EquipmentSelectionData[];
  startTime: string;
  endTime: string;
  setSelectedTrack: (track: TrackData | null) => void;
  setSelectedMotorcycle: (bike: MotorcycleData | null) => void;
  setSelectedEquipments: (equipments: EquipmentSelectionData[]) => void;
  setBookingTimes: (start: string, end: string) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedTrack, setSelectedTrack] = useState<TrackData | null>(null);
  const [selectedMotorcycle, setSelectedMotorcycle] = useState<MotorcycleData | null>(null);
  const [selectedEquipments, setSelectedEquipments] = useState<EquipmentSelectionData[]>([]);
  
  // Default de horários para amanhã 09:00 - 11:00
  const getDefaultTimes = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    const start = d.toISOString().slice(0, 16);
    d.setHours(11, 0, 0, 0);
    const end = d.toISOString().slice(0, 16);
    return { start, end };
  };

  const defaults = getDefaultTimes();
  const [startTime, setStartTime] = useState(defaults.start);
  const [endTime, setEndTime] = useState(defaults.end);

  const setBookingTimes = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
  };

  const resetBooking = () => {
    setSelectedTrack(null);
    setSelectedMotorcycle(null);
    setSelectedEquipments([]);
  };

  return (
    <BookingContext.Provider
      value={{
        selectedTrack,
        selectedMotorcycle,
        selectedEquipments,
        startTime,
        endTime,
        setSelectedTrack,
        setSelectedMotorcycle,
        setSelectedEquipments,
        setBookingTimes,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking deve ser utilizado dentro de um BookingProvider');
  }
  return context;
};
