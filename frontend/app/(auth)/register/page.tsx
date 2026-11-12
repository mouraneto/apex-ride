'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, Heart, Zap, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    cnh_number: '',
    // Prontuário Médico
    emergency_contact: '',
    blood_type: 'O+',
    sus_card: '',
    // Nível e EPIs
    pilot_level: 'INICIANTE',
    helmet_size: '58',
    suit_size: '52',
    glove_size: 'L',
    boot_size: '42',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(formData);
      router.push('/tracks');
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Erro ao criar conta. Revise os campos obrigatórios.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative">
      <div className="text-center mb-10">
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white italic tracking-wider uppercase">
          FICHA DE HOMOLOGAÇÃO DE PILOTO
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Cadastro de telemetria, dados de proteção em pista e conformidade LGPD
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-racing-red/10 border border-racing-red/40 rounded-xl flex items-center gap-3 text-racing-red text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bloco 1: Credenciais e Identificação */}
        <div className="bg-racing-card border border-racing-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-racing-border">
            <User className="w-5 h-5 text-racing-cyan" />
            <h2 className="font-display font-black text-base text-white uppercase tracking-wider">
              1. Credenciais & Identificação
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-display font-bold text-gray-400 uppercase mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Ayrton Senna"
                className="w-full bg-racing-bg border border-racing-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-racing-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-display font-bold text-gray-400 uppercase mb-1">
                E-mail *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="piloto@apexride.com"
                className="w-full bg-racing-bg border border-racing-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-racing-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-display font-bold text-gray-400 uppercase mb-1">
                Senha de Acesso (Mín. 8 caracteres) *
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-racing-bg border border-racing-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-racing-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-display font-bold text-gray-400 uppercase mb-1">
                Telefone Celular (WhatsApp) *
              </label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="(19) 98888-7777"
                className="w-full bg-racing-bg border border-racing-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-racing-cyan"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-display font-bold text-gray-400 uppercase mb-1">
                Número da CNH (Opcional para autódromos fechados)
              </label>
              <input
                type="text"
                name="cnh_number"
                value={formData.cnh_number}
                onChange={handleChange}
                placeholder="12345678900"
                className="w-full bg-racing-bg border border-racing-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-racing-cyan"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Prontuário Médico de Emergência (LGPD) */}
        <div className="bg-racing-card border border-racing-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-2 pb-3 border-b border-racing-border">
            <Heart className="w-5 h-5 text-racing-red" />
            <h2 className="font-display font-black text-base text-white uppercase tracking-wider">
              2. Ficha Médica de Emergência (Proteção LGPD)
            </h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Estes dados ficam criptografados e são visíveis apenas para os fiscais e equipe de resgate na pista.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-display font-bold text-gray-400 uppercase mb-1">
                Contato de Emergência (Nome e Telefone) *
              </label>
              <input
                type="text"
                name="emergency_contact"
                required
                value={formData.emergency_contact}
                onChange={handleChange}
                placeholder="Marine Moura - (19) 97777-6666"
                className="w-full bg-racing-bg border border-racing-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-racing-red"
              />
            </div>

            <div>
              <label className="block text-xs font-display font-bold text-gray-400 uppercase mb-1">
                Tipo Sanguíneo *
              </label>
              <select
                name="blood_type"
                value={formData.blood_type}
                onChange={handleChange}
                className="w-full bg-racing-bg border border-racing-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-racing-red"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-display font-bold text-gray-400 uppercase mb-1">
                Número do Cartão SUS (Opcional para pronto atendimento)
              </label>
              <input
                type="text"
                name="sus_card"
                value={formData.sus_card}
                onChange={handleChange}
                placeholder="123456789012345"
                className="w-full bg-racing-bg border border-racing-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-racing-red"
              />
            </div>
          </div>
        </div>

        {/* Bloco 3: Perfil de Pilotagem e Equipamentos */}
        <div className="bg-racing-card border border-racing-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-racing-border">
            <Zap className="w-5 h-5 text-racing-yellow" />
            <h2 className="font-display font-black text-base text-white uppercase tracking-wider">
              3. Nível de Pilotagem & Tamanhos de EPI
            </h2>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-display font-bold text-gray-400 uppercase mb-2">
              Seu Nível de Experiência em Pista (Define a Trava Eletrônica) *
            </label>
            <select
              name="pilot_level"
              value={formData.pilot_level}
              onChange={handleChange}
              className="w-full bg-racing-bg border border-racing-yellow/50 rounded-lg px-3 py-2.5 text-sm text-racing-yellow font-display font-bold focus:outline-none"
            >
              <option value="INICIANTE">INICIANTE (Trava eletrônica em 100 km/h)</option>
              <option value="AMADOR">AMADOR (Trava eletrônica em 160 km/h)</option>
              <option value="INTERMEDIARIO">INTERMEDIÁRIO (Trava eletrônica em 220 km/h)</option>
              <option value="AVANCADO">AVANÇADO (Trava eletrônica em 280 km/h)</option>
              <option value="PROFISSIONAL">PROFISSIONAL (Sem limitação eletrônica)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-display font-bold text-gray-400 uppercase mb-1">
                Capacete
              </label>
              <select
                name="helmet_size"
                value={formData.helmet_size}
                onChange={handleChange}
                className="w-full bg-racing-bg border border-racing-border rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="54">54 (XS)</option>
                <option value="56">56 (S)</option>
                <option value="58">58 (M)</option>
                <option value="60">60 (L)</option>
                <option value="62">62 (XL)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-display font-bold text-gray-400 uppercase mb-1">
                Macacão
              </label>
              <select
                name="suit_size"
                value={formData.suit_size}
                onChange={handleChange}
                className="w-full bg-racing-bg border border-racing-border rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="48">48 (S)</option>
                <option value="50">50 (M)</option>
                <option value="52">52 (L)</option>
                <option value="54">54 (XL)</option>
                <option value="56">56 (XXL)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-display font-bold text-gray-400 uppercase mb-1">
                Luvas
              </label>
              <select
                name="glove_size"
                value={formData.glove_size}
                onChange={handleChange}
                className="w-full bg-racing-bg border border-racing-border rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-display font-bold text-gray-400 uppercase mb-1">
                Botas
              </label>
              <select
                name="boot_size"
                value={formData.boot_size}
                onChange={handleChange}
                className="w-full bg-racing-bg border border-racing-border rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="39">39</option>
                <option value="40">40</option>
                <option value="41">41</option>
                <option value="42">42</option>
                <option value="43">43</option>
                <option value="44">44</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-racing-cyan to-blue-500 hover:from-racing-cyan/90 hover:to-blue-600 text-racing-bg font-display font-black italic tracking-widest uppercase rounded-xl shadow-neon-cyan transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
        >
          {loading ? 'PROCESSANDO HOMOLOGAÇÃO...' : 'CONCLUIR CADASTRO E AVANÇAR'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-gray-400">
        Já possui conta?{' '}
        <Link href="/login" className="text-racing-cyan font-bold hover:underline">
          Acesse pelo Login
        </Link>
      </div>
    </div>
  );
}
