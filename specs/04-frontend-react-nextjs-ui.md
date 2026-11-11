```markdown
# 04. Frontend Specification (Next.js + NFS Arcade UI) - ApexRide

## 1. Visão Geral e Filosofia de Design System

O frontend do **ApexRide** é desenvolvido em **Next.js 14+ (App Router)** com **React**, **Tailwind CSS**, **Framer Motion** e **Lucide Icons**. Sua proposta visual é recriar a atmosfera imersiva dos menus de seleção de veículos de jogos clássicos de corrida (*Need for Speed: Underground 2*, *Need for Speed: Most Wanted* e *Midnight Club 3*).

### 1.1. Princípios de Experiência do Usuário (UX/UI Arcade)
* **Dark Theme Profundo com Contrastes Neon:** Fundo preto asfalto fosco com elementos operacionais e estatísticos realçados por brilhos neon (*Cyberpunk/Racing Neon*).
* **Barras de Desempenho (Gauge Meters):** Atributos das motocicletas (Velocidade Máxima, Aceleração, Dirigibilidade/Curva, Frenagem) representados graficamente por barras de progresso animadas e divididas em blocos.
* **Badges de Nível de Pilotagem:** Elementos visuais proeminentes no perfil e no cabeçalho indicando a categoria do piloto (`BRONZE PILOT`, `SILVER PILOT`, `GOLD PILOT`, `PLATINUM PILOT`, `PRO RACER`) e seu teto de velocidade destravado.
* **Passes de Corrida Digitais (Track Tickets):** Visual de ingresso de autódromo com QR Code centralizado, detalhes do circuito, modelo do veículo e botão de download/impressão.

---

## 2. Design System Tokens (Tailwind CSS Config)

### 2.1. Paleta de Cores (`tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        racing: {
          bg: '#090A0F',          // Asfalto Dark / Fundo Dominante
          card: '#12151E',        // Fundo de Cards e Modais
          border: '#1F2433',      // Bordas sutis
          cyan: '#00F0FF',        // Ciano Elétrico (Destaques primários)
          yellow: '#FFEA00',      // Amarelo Racing (Alertas / Stats de Aceleração)
          red: '#FF0055',         // Vermelho Nitro (Ações críticas / Limite de velocidade)
          green: '#00FF66',       // Verde Pista (Confirmação / Status Disponível)
          purple: '#A855F7',      // Roxo Profissional (Rankings / Badges Especiais)
        },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.4)',
        'neon-yellow': '0 0 15px rgba(255, 234, 0, 0.4)',
        'neon-red': '0 0 15px rgba(255, 0, 85, 0.4)',
      },
    },
  },
  plugins: [],
}

```

---

## 3. Arquitetura de Diretórios e Componentização (`/frontend`)

```text
frontend/
├── app/
│   ├── layout.tsx                # Layout Raiz (Fontes, Providers de Estado, Navbar Arcade)
│   ├── page.tsx                  # Landing Page / Hero Section Estilo NFS
│   ├── (auth)/
│   │   ├── login/page.tsx        # Login com Efeito Neon & Cookie Auth
│   │   └── register/page.tsx     # Cadastro com Ficha Médica e Tamanhos de Equipamentos
│   ├── tracks/
│   │   └── page.tsx              # Seleção de Autódromos (Mapa de Fases Arcade)
│   ├── garage/
│   │   └── page.tsx              # Garagem de Motos com Comparador de Gauge Meters
│   ├── checkout/
│   │   └── page.tsx              # Resumo da Reserva, Equipamentos, Seguro e Checkout Mock
│   ├── my-garage/
│   │   └── page.tsx              # Painel do Piloto (Ingressos QR Code & Telemetria)
│   ├── leaderboard/
│   │   └── page.tsx              # Placar Geral de Melhores Voltas e Velocidade
│   └── operator/
│       └── scanner/page.tsx      # Scanner de QR Code para Fiscais e Equipe Médica
├── components/
│   ├── ui/
│   │   ├── GaugeMeter.tsx        # Componente de Barra de Status do Veículo
│   │   ├── PilotBadge.tsx        # Badge de Nível de Pilotagem e Trava de Velocidade
│   │   ├── TicketCard.tsx        # Passe de Pista Digital com QR Code
│   │   ├── Navbar.tsx            # HUD de Navegação Superior
│   │   └── TelemetryChart.tsx    # Gráfico de Telemetria de Voltas (Recharts/Chart.js)
│   └── garage/
│       ├── MotorcycleCard.tsx    # Card Selecionável com Animação Hover 3D/Parallax
│       └── TrackSelector.tsx     # Seletor de Autódromo com Mapa e Extensão da Pista
├── context/
│   ├── AuthContext.tsx           # Gerenciador Global de Sessão e Perfil do Usuário
│   └── BookingContext.tsx        # Estado Temporário da Reserva (Pista -> Moto -> Equipamentos)
├── services/
│   └── api.ts                    # Cliente Axios/Fetch com credentials: 'include'
├── public/
│   ├── images/                   # Motos, Pistas, Logos Arcade
│   └── fonts/                    # Fontes Orbitron / Inter
├── package.json
└── tailwind.config.js

```

---

## 4. Detalhamento das Páginas e Fluxos de Tela

### 4.1. Landing Page (`/`)

* **Hero Section:** Banner imersivo com moto esportiva em fundo escuro com iluminação neon.
* **CTA Principal:** Botão *"ENTRAR NA GARAGEM"*, redirecionando para a seleção de pistas.
* **Demonstrativo das Pistas:** Carousel com visualizador de autódromos parceiros (Interlagos, Capuava, Velo Città).

### 4.2. Cadastro Gamificado (`/register`)

Formulário dividido em 3 blocos visuais estilizados:

1. **Credenciais de Acesso:** Nome, E-mail, Senha, Telefone, CNH.
2. **Prontuário Médico de Emergência (LGPD Protected):** Tipo Sanguíneo (`A+`, `O+`, etc.), Contato de Emergência e Número do Cartão SUS.
3. **Perfil de Pista & Equipamentos:** Escolha do Nível de Pilotagem inicial e tamanhos habituais para Capacete, Macacão, Luvas e Botas.

### 4.3. Seleção de Autódromos (`/tracks`)

* Interface estilizada como "Mapa de Fases" de jogos arcade.
* Exibição de cards contendo extensão do circuito em km, localização, valor da taxa de pista por hora e quantidade de motocicletas disponíveis no momento.

### 4.4. A Garagem de Motos (`/garage`)

* Exibição do catálogo de veículos filtrados pelo autódromo selecionado.
* **Painel de Atributos (Gauge Meters):**
* **Velocidade Máxima Base (km/h):** Exibe a velocidade nominal da moto e contrasta com o limite real permitido para o nível do piloto logado.
* **Aceleração (0-100 km/h):** Barra gráfica proporcional.
* **Dirigibilidade & Curva:** Nível de precisão do ciclismo da moto.
* **Potência (CV / CC):** Cilindrada e cavalagem do motor.



### 4.5. Checkout & Confirmação (`/checkout`)

* **Seletor de Equipamentos:** Exibe capacetes, macacões, luvas e botas com sugestão pré-selecionada baseada no perfil do usuário.
* **Resumo Financeiro Trava-de-Velocidade:** Tabela discriminando:
* Tarifa da Moto por Hora $\times$ Horas de Pista
* Tarifa da Pista por Hora $\times$ Horas de Pista
* Aluguel de Equipamentos selecionados
* Seguro de Pista Obrigatório (`R$ 75,00`)
* **Velocidade Efetiva Liberada:** Destaque em vermelho neon com a trava eletrônica ativada para o piloto.


* **Botão de Confirmação Mock:** *"CONFIRMAR RESERVA E GERAR INGRESSO"*.

### 4.6. Painel "Minha Garagem" & Ingressos (`/my-garage`)

* Exibição das reservas do piloto organizadas por status (`CONFIRMED`, `COMPLETED`).
* **Passe de Corrida Digital (Ticket):** Card imprimível contendo QR Code Base64 contendo o `rental_uuid`, horário de entrada no autódromo, modelo da motocicleta reservada e termo de responsabilidade aceito.
* **Aba de Telemetria pós-corrida:** Gráfico interativo exibindo tempos por volta, velocidade máxima atingida e força G lateral nas curvas.

### 4.7. Placar de Líderes (`/leaderboard`)

* Tabela HUD com iluminação neon estilo placar de fliperama.
* Filtros por autódromo e modelo de motocicleta.
* Destaque em Ouro, Prata e Bronze para os 3 pilotos com melhor tempo de volta e maior velocidade média acumulada.

### 4.8. Scanner do Operador de Pista (`/operator/scanner`)

* Tela limpa e funcional otimizada para tablets ou smartphones usados pelos fiscais de pista.
* Leitor de QR Code via câmera integrada ou campo de digitação manual do `rental_uuid`.
* **Resultado do Scan:**
* **Green Card:** Reserva confirmada e dentro do horário. Exibe a foto da moto, limite de velocidade liberado e exibe o bloco **"Ficha Médica de Emergência"** (Tipo sanguíneo, SUS, contato de emergência).
* **Red Card:** QR Code inválido, fora do horário ou reserva cancelada.



---

## 5. Implementação dos Componentes Reutilizáveis (React / TypeScript)

### 5.1. Componente Gauge Meter (`components/ui/GaugeMeter.tsx`)

```tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GaugeMeterProps {
  label: string;
  value: number; // Valor de 0 a 100
  maxValue?: number;
  color?: 'cyan' | 'yellow' | 'red' | 'green';
  unit?: string;
}

export const GaugeMeter: React.FC<GaugeMeterProps> = ({
  label,
  value,
  maxValue = 100,
  color = 'cyan',
  unit = '%',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const blocks = 20; // 20 blocos graficos estilo NFS
  const activeBlocks = Math.round((percentage / 100) * blocks);

  const colorMap = {
    cyan: 'bg-racing-cyan shadow-neon-cyan border-racing-cyan',
    yellow: 'bg-racing-yellow shadow-neon-yellow border-racing-yellow',
    red: 'bg-racing-red shadow-neon-red border-racing-red',
    green: 'bg-racing-green border-racing-green',
  };

  return (
    <div className="w-full my-2 font-display">
      <div className="flex justify-between items-center mb-1 text-xs">
        <span className="uppercase tracking-wider text-gray-400 font-bold">{label}</span>
        <span className="text-white font-extrabold text-sm">
          {value} <span className="text-xs text-gray-500">{unit}</span>
        </span>
      </div>

      {/* Grid de Blocos Arcade */}
      <div className="flex gap-1 bg-racing-bg p-1.5 rounded border border-racing-border">
        {Array.from({ length: blocks }).map((_, index) => {
          const isActive = index < activeBlocks;
          return (
            <motion.div
              key={index}
              initial={{ scaleY: 0.2, opacity: 0.3 }}
              animate={{
                scaleY: isActive ? 1 : 0.4,
                opacity: isActive ? 1 : 0.15,
              }}
              transition={{ duration: 0.2, delay: index * 0.01 }}
              className={`h-3 flex-1 rounded-sm transition-colors ${
                isActive ? colorMap[color] : 'bg-gray-700'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

```

### 5.2. Componente Card de Garagem (`components/garage/MotorcycleCard.tsx`)

```tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { GaugeMeter } from '../ui/GaugeMeter';
import { ShieldAlert, Zap } from 'lucide-react';

interface MotorcycleProps {
  id: str;
  brand: string;
  model: string;
  cc: number;
  baseTopSpeed: number;
  effectiveSpeedLimit: number;
  hourlyPrice: number;
  imageUrl: string;
  onSelect: (id: string) => void;
}

export const MotorcycleCard: React.FC<MotorcycleProps> = ({
  id,
  brand,
  model,
  cc,
  baseTopSpeed,
  effectiveSpeedLimit,
  hourlyPrice,
  imageUrl,
  onSelect,
}) => {
  const isLimited = effectiveSpeedLimit < baseTopSpeed;

  return (
    <div className="bg-racing-card border border-racing-border hover:border-racing-cyan transition-all duration-300 rounded-xl p-5 shadow-2xl relative overflow-hidden group">
      {/* Glow Neon de fundo ao passar o mouse */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-racing-cyan/10 rounded-full blur-3xl group-hover:bg-racing-cyan/20 transition-all" />

      {/* Header com Marca e Preço */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-display uppercase tracking-widest text-racing-cyan font-bold">
            {brand}
          </span>
          <h3 className="text-xl font-display font-extrabold italic text-white tracking-wide">
            {model}
          </h3>
          <span className="text-xs text-gray-400">{cc} CC • Esportiva</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-400 block">Locação / hora</span>
          <span className="text-xl font-display font-extrabold text-racing-yellow">
            R\$ {hourlyPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Imagem do Veículo */}
      <div className="relative h-44 w-full my-3 rounded-lg overflow-hidden bg-racing-bg border border-racing-border/50 flex items-center justify-center">
        <Image ${model}`} '/images/bikes/placeholder.png'} alt="{`${brand}" className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" fill src="{imageUrl" ||/>
      </div>

      {/* Alerta de Trava de Velocidade Eletrônica */}
      {isLimited && (
        <div className="bg-racing-red/10 border border-racing-red/40 rounded-lg p-2 mb-3 flex items-center gap-2 text-racing-red text-xs font-bold">
          <ShieldAlert className="w-4 h-4 shrink-0"/>
          <span>Velocidade travada em {effectiveSpeedLimit} km/h (Seu Nível)</span>
        </div>
      )}

      {/* Barras de Status Arcade */}
      <div className="space-y-1">
        <GaugeMeter 'cyan'} 'red' : ? color="{isLimited" label="Velocidade Liberada" maxValue="{320}" unit="km/h" value="{effectiveSpeedLimit}"/>
        <GaugeMeter color="yellow" label="Velocidade Nominal Moto" maxValue="{320}" unit="km/h" value="{baseTopSpeed}"/>
      </div>

      {/* Botão Selecionar */}
      <button
        onClick={() => onSelect(id)}
        className="w-full mt-4 py-3 bg-racing-cyan hover:bg-racing-cyan/90 text-racing-bg font-display font-extrabold italic uppercase rounded-lg shadow-neon-cyan transition-all flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4 fill-current"/>
        ESCOLHER ESTA MOTO
      </button>
    </div>
  );
};

```

### 5.3. Componente Ingresso Passe de Corrida (`components/ui/TicketCard.tsx`)

```tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar, Clock, MapPin, Download, QrCode } from 'lucide-react';

interface TicketProps {
  rentalUuid: str;
  trackName: string;
  motorcycleModel: string;
  dateStr: string;
  timeStr: string;
  speedLimit: number;
  qrCodeBase64: string;
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
    <div className="bg-racing-card border-2 border-racing-cyan rounded-2xl p-6 shadow-neon-cyan max-w-md mx-auto text-white font-sans relative overflow-hidden">
      {/* Tarja Superior Arcade */}
      <div className="bg-racing-cyan text-racing-bg font-display font-black text-center py-1 text-xs uppercase tracking-widest rounded-t-lg -mx-6 -mt-6 mb-6">
        ApexRide Official Track Pass
      </div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs text-gray-400 block uppercase font-bold">Piloto Cadastrado</span>
          <h4 className="text-lg font-display font-bold text-racing-yellow">{pilotName}</h4>
        </div>
        <span className="bg-racing-red/20 text-racing-red text-xs px-2 py-1 rounded font-bold border border-racing-red/40">
          MAX {speedLimit} KM/H
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-300 mb-6 bg-racing-bg p-3 rounded-lg border border-racing-border">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-racing-cyan"/>
          <span>{trackName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-racing-cyan"/>
          <span>{dateStr}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-racing-cyan"/>
          <span>{timeStr}</span>
        </div>
      </div>

      {/* Exibição do QR Code Centralizado */}
      <div className="text-center bg-white p-4 rounded-xl border-2 border-racing-cyan inline-block w-full my-2">
        <div className="relative w-44 h-44 mx-auto">
          <Image alt="QR Code da Reserva" className="object-contain" fill src="{qrCodeBase64}"/>
        </div>
        <span className="text-black font-mono text-xs font-bold block mt-2 tracking-wider">
          UUID: {rentalUuid.slice(0, 8)}...{rentalUuid.slice(-4)}
        </span>
      </div>

      <p className="text-xs text-gray-400 text-center my-3">
        Apresente este QR Code na entrada do autódromo ao fiscal de pista.
      </p>

      <button
        onClick={handlePrint}
        className="w-full py-2.5 bg-racing-border hover:bg-gray-700 text-white font-display text-xs font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4"/>
        Baixar / Imprimir Ingresso PDF
      </button>
    </div>
  );
};

```

---

## 6. Cliente de API REST & Controle de Sessão (`services/api.ts`)

```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1',
  withCredentials: true, // Garante que os Cookies HTTP-Only sejam enviados
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento padronizado de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redireciona para o login em caso de sessão expirada (se no navegador)
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

```

```

```