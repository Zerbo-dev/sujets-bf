import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette alignée sur la maquette fournie : bleu principal sur
        // fond clair, cartes blanches, pastilles de statut.
        brand: {
          DEFAULT: '#2F6FED', // bleu principal — CTA, liens, icônes actives
          dark: '#1D4ED8', // hover / états actifs
          light: '#EEF3FF', // fonds de pastille, bannières info
        },
        status: {
          pending: '#D97706', // en attente
          success: '#16A34A', // validé
          info: '#2563EB', // en cours / en vérification
          danger: '#DC2626', // refusé
          warn: '#9333EA', // correction demandée
        },
      },
    },
  },
  plugins: [],
};

export default config;
