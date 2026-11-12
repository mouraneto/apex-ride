import Link from 'next/link';
import Image from 'next/image';
import { Zap, ShieldCheck, Trophy, Gauge, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-racing-cyan/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-racing-red/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-racing-card border border-racing-cyan/40 text-racing-cyan text-xs font-display font-black tracking-widest shadow-neon-cyan mb-8 uppercase animate-pulse">
          <Zap className="w-3.5 h-3.5 fill-current" />
          TEMPORADA 2026 DE TRACK DAYS ABERTA
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black italic tracking-tight text-white uppercase max-w-5xl leading-none">
          PILOTE AS MAIORES <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-racing-cyan via-white to-racing-yellow">
            SUPERBIKES DO MUNDO
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-gray-300 max-w-2xl font-light">
          Reserve Ducati, BMW, Yamaha e Kawasaki em autódromos oficiais com
          trava eletrônica progressiva por nível de pilotagem e telemetria em tempo real.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <Link
            href="/tracks"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-racing-cyan to-blue-500 text-racing-bg font-display font-black italic tracking-widest text-base shadow-neon-cyan hover:scale-105 transition-all flex items-center justify-center gap-3 uppercase"
          >
            ENTRAR NA GARAGEM
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/leaderboard"
            className="px-8 py-4 rounded-xl bg-racing-card border border-racing-border hover:border-racing-yellow text-white font-display font-bold tracking-wider text-sm transition-all flex items-center justify-center gap-2 uppercase"
          >
            <Trophy className="w-4 h-4 text-racing-yellow" />
            VER LEADERBOARD
          </Link>
        </div>

        {/* Hero Bike Preview Showcase */}
        <div className="relative w-full max-w-4xl h-72 sm:h-96 mt-16 rounded-2xl overflow-hidden border border-racing-border bg-gradient-to-b from-racing-card to-racing-bg flex items-center justify-center p-4">
          <Image
            src="/images/bikes/panigale_v2.svg"
            alt="Ducati Panigale V2"
            fill
            className="object-contain p-6 hover:scale-105 transition-transform duration-700"
            priority
          />
          <div className="absolute bottom-4 left-6 text-left">
            <span className="text-xs font-display text-racing-red font-bold uppercase">Destaque da Frota</span>
            <h4 className="font-display font-black text-xl text-white italic">DUCATI PANIGALE V2</h4>
          </div>
          <div className="absolute bottom-4 right-6 text-right">
            <span className="text-xs text-gray-400 block font-mono">LIMITE MÁXIMO</span>
            <span className="font-display font-black text-2xl text-racing-yellow">270 KM/H</span>
          </div>
        </div>
      </section>

      {/* Grid de Pilares Técnicos */}
      <section className="border-t border-racing-border bg-racing-card/40 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display font-black text-3xl text-white italic tracking-wider">
              ENGENHARIA & SEGURANÇA ARCADE
            </h2>
            <p className="text-gray-400 text-sm mt-2">Tecnologia desenvolvida para pilotos do iniciante ao profissional</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-racing-card p-6 rounded-2xl border border-racing-border hover:border-racing-cyan transition-colors">
              <div className="w-12 h-12 rounded-xl bg-racing-cyan/10 border border-racing-cyan/30 flex items-center justify-center text-racing-cyan mb-4 shadow-neon-cyan">
                <Gauge className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg text-white mb-2">SPEED GOVERNOR</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Trava eletrônica de velocidade calibrada rigorosamente para o seu nível de experiência, garantindo evolução segura e adrenalina controlada.
              </p>
            </div>

            <div className="bg-racing-card p-6 rounded-2xl border border-racing-border hover:border-racing-yellow transition-colors">
              <div className="w-12 h-12 rounded-xl bg-racing-yellow/10 border border-racing-yellow/30 flex items-center justify-center text-racing-yellow mb-4 shadow-neon-yellow">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg text-white mb-2">TELEMETRIA & RANKING</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Sensores de bordo registram seus tempos de volta, aceleração G nas curvas e velocidade média, alimentando o placar arcade global.
              </p>
            </div>

            <div className="bg-racing-card p-6 rounded-2xl border border-racing-border hover:border-racing-red transition-colors">
              <div className="w-12 h-12 rounded-xl bg-racing-red/10 border border-racing-red/30 flex items-center justify-center text-racing-red mb-4 shadow-neon-red">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg text-white mb-2">INGRESSO QR & LGPD</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                QR Code limpo de acesso presencial no autódromo com desbloqueio instantâneo da ficha médica de emergência exclusiva para os fiscais de pista.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Autódromos Parceiros */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-xs font-display text-racing-cyan font-bold tracking-widest uppercase">Circuitos Oficiais</span>
            <h2 className="font-display font-black text-3xl text-white italic">AUTÓDROMOS HOMOLOGADOS</h2>
          </div>
          <Link href="/tracks" className="text-xs font-display font-bold text-racing-yellow hover:underline flex items-center gap-1">
            VER TODAS AS PISTAS <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl overflow-hidden border border-racing-border relative group h-64">
            <Image src="/images/tracks/interlagos.svg" alt="Interlagos" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-racing-bg via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div>
                <h4 className="font-display font-bold text-white text-base">Interlagos (F1 / Moto1000GP)</h4>
                <span className="text-xs text-gray-400">São Paulo - SP • 4.30 km</span>
              </div>
              <span className="font-display font-black text-racing-cyan text-sm">R$ 250/h</span>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-racing-border relative group h-64">
            <Image src="/images/tracks/capuava.svg" alt="Fazenda Capuava" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-racing-bg via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div>
                <h4 className="font-display font-bold text-white text-base">Fazenda Capuava</h4>
                <span className="text-xs text-gray-400">Indaiatuba - SP • 2.70 km</span>
              </div>
              <span className="font-display font-black text-racing-yellow text-sm">R$ 180/h</span>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-racing-border relative group h-64">
            <Image src="/images/tracks/velocitta.svg" alt="Velo Citta" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-racing-bg via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div>
                <h4 className="font-display font-bold text-white text-base">Velo Città (FIA / FIM)</h4>
                <span className="text-xs text-gray-400">Mogi Guaçu - SP • 3.40 km</span>
              </div>
              <span className="font-display font-black text-racing-red text-sm">R$ 220/h</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
