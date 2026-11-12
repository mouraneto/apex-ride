'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PilotBadge } from '@/components/ui/PilotBadge';
import { Gauge, ShieldCheck, Trophy, LogOut, User, Flame } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = [
    { href: '/tracks', label: 'PISTAS' },
    { href: '/garage', label: 'GARAGEM' },
    { href: '/leaderboard', label: 'LEADERBOARD', icon: Trophy },
    { href: '/my-garage', label: 'MINHA GARAGEM', icon: Gauge },
  ];

  return (
    <header className="sticky top-0 z-50 bg-racing-bg/90 backdrop-blur-md border-b border-racing-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-racing-cyan to-racing-red flex items-center justify-center p-0.5 shadow-neon-cyan group-hover:shadow-neon-red transition-all">
            <div className="w-full h-full bg-racing-bg rounded-md flex items-center justify-center">
              <Flame className="w-6 h-6 text-racing-cyan group-hover:text-racing-red transition-colors" />
            </div>
          </div>
          <div>
            <span className="font-display font-black text-2xl tracking-widest text-white italic">
              APEX<span className="text-racing-cyan">RIDE</span>
            </span>
            <span className="block text-[9px] font-mono tracking-widest text-gray-400 -mt-1 uppercase">
              Superbike Track Hub
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-display text-xs font-bold tracking-widest transition-all py-1 border-b-2 flex items-center gap-1.5 ${
                  isActive
                    ? 'border-racing-cyan text-racing-cyan shadow-neon-cyan'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {link.label}
              </Link>
            );
          })}

          {user?.role === 'OPERATOR' && (
            <Link
              href="/operator/scanner"
              className={`font-display text-xs font-black tracking-widest transition-all py-1 border-b-2 flex items-center gap-1.5 ${
                pathname.startsWith('/operator')
                  ? 'border-racing-red text-racing-red shadow-neon-red'
                  : 'border-transparent text-racing-red/80 hover:text-racing-red'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              SCANNER FISCAL
            </Link>
          )}
        </nav>

        {/* User HUD / Auth actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <span className="block text-xs font-bold text-white truncate max-w-[130px]">
                  {user.name}
                </span>
                <PilotBadge level={user.pilot_level} showLimit={false} />
              </div>

              <button
                onClick={() => logout()}
                title="Encerrar Sessão"
                className="p-2 rounded-lg bg-racing-card border border-racing-border text-gray-400 hover:text-racing-red hover:border-racing-red transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-display font-bold text-gray-300 hover:text-white transition-colors"
              >
                LOGIN
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg bg-racing-cyan text-racing-bg font-display font-extrabold text-xs tracking-wider shadow-neon-cyan hover:bg-racing-cyan/90 transition-all uppercase"
              >
                REGISTRO PILOTO
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
