/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
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
};
