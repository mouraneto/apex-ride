'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/services/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'PILOT' | 'OPERATOR';
  phone: string;
  cnh_number?: string;
  pilot_level: 'INICIANTE' | 'AMADOR' | 'INTERMEDIARIO' | 'AVANCADO' | 'PROFISSIONAL';
  helmet_size?: string;
  suit_size?: string;
  glove_size?: string;
  boot_size?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await api.get<UserProfile>('/auth/me');
      setUser(response.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.post<UserProfile>('/auth/login', credentials);
    setUser(res.data);
  };

  const register = async (userData: any) => {
    const res = await api.post<UserProfile>('/auth/register', userData);
    setUser(res.data);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
