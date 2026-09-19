import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette inspirée de l'archive scolaire burkinabè : un or/ambre
        // (papier ancien, tampon administratif) sur un vert profond qui
        // évoque le drapeau du Burkina Faso — remplace l'ancien bleu
        // générique utilisé partout dans le code.
        brand: {
          DEFAULT: '#C8891F', // ambre — CTA, liens actifs
          deep: '#123B2E', // vert profond — header, hero, texte de lien sur fond clair
          light: '#F4E9D6', // fond crème clair (cartes en surbrillance, badges)
        },
      },
    },
  },
  plugins: [],
};

export default config;
