import { palette } from './src/config/palette.js';

/** Paleta tomada del logo. `colors` reemplaza la paleta de Tailwind por completo:
 *  si un color no está aquí, no se puede usar en el sitio. */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      ...palette,
      // Velo para el visor de fotos a pantalla completa.
      scrim: 'rgba(11, 20, 23, 0.94)',
    },
    fontFamily: {
      sans: ['"Manrope Variable"', 'Manrope', 'system-ui', 'sans-serif'],
    },
    extend: {
      maxWidth: { content: '1200px' },
      borderRadius: { card: '12px', btn: '10px' },
      minHeight: { btn: '48px', tap: '44px' },
      boxShadow: { hover: '0 6px 20px rgba(20, 38, 43, 0.08)', sheet: '0 -8px 30px rgba(20, 38, 43, 0.12)' },
    },
  },
  plugins: [],
};
