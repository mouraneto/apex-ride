'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Flame, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams.get('expired');
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      router.push('/tracks');
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Erro ao realizar login. Verifique suas credenciais.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-racing-card border-2 border-racing-border rounded-2xl p-8 shadow-2xl relative">
      <div className="text-center mb-8">
        <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-racing-cyan to-racing-red p-0.5 shadow-neon-cyan mb-3">
          <div className="w-full h-full bg-racing-bg rounded-[10px] flex items-center justify-center">
            <Flame className="w-6 h-6 text-racing-cyan" />
          </div>
        </div>
        <h1 className="font-display font-black text-2xl text-white tracking-wider uppercase italic">
          ACESSO AO COCKPIT
        </h1>
        <p className="text-xs text-gray-400 mt-1">Insira suas credenciais para gerenciar sua garagem</p>
      </div>

      {expired && (
        <div className="mb-6 p-3 bg-racing-yellow/10 border border-racing-yellow/40 rounded-lg flex items-center gap-2 text-racing-yellow text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Sua sessão expirou. Faça login novamente.</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-racing-red/10 border border-racing-red/40 rounded-lg flex items-center gap-2 text-racing-red text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-display font-bold text-gray-300 uppercase mb-1.5">
            E-mail do Piloto
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="piloto@apexride.com"
              className="w-full bg-racing-bg border border-racing-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-racing-cyan transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-display font-bold text-gray-300 uppercase mb-1.5">
            Senha
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-racing-bg border border-racing-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-racing-cyan transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 bg-racing-cyan hover:bg-racing-cyan/90 text-racing-bg font-display font-black italic tracking-widest uppercase rounded-lg shadow-neon-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'AUTENTICANDO...' : 'ENTRAR NA PISTA'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-400">
        Ainda não possui licença?{' '}
        <Link href="/register" className="text-racing-cyan font-bold hover:underline">
          Cadastre-se como Piloto
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-racing-cyan/10 rounded-full blur-[140px] pointer-events-none" />
      <Suspense fallback={<div className="text-racing-cyan font-display text-sm">Carregando Cockpit...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
