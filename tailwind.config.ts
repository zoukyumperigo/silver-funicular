import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Academic-Chic Color Palette
        parchment: {
          50: '#FDFBF7',
          100: '#FAF6ED',
          200: '#F4ECD8',
          300: '#EDE2C3',
          400: '#E6D8AE',
          500: '#DFCE99',
          600: '#D8C484',
          700: '#C4A860',
          800: '#9D8548',
          900: '#75622F',
        },
        burgundy: {
          50: '#F5E6E8',
          100: '#E6BFC4',
          200: '#D6999D',
          300: '#C77276',
          400: '#B74B4F',
          500: '#800020', // Primary burgundy
          600: '#66001A',
          700: '#4D0013',
          800: '#33000D',
          900: '#1A0007',
        },
        gold: {
          50: '#FAF5E6',
          100: '#F3E5BF',
          200: '#EBD699',
          300: '#E4C673',
          400: '#DCB64D',
          500: '#B8860B', // Academic gold
          600: '#936B09',
          700: '#6E5007',
          800: '#4A3605',
          900: '#251B02',
        },
        ivory: {
          50: '#FFFFFF',
          100: '#FEFEFE',
          200: '#FCFCFC',
          300: '#F9F9F9',
          400: '#F7F7F7',
          500: '#F5F5F5',
          600: '#E8E8E8',
          700: '#DBDBDB',
          800: '#CECECE',
          900: '#C1C1C1',
        },
      },
      fontFamily: {
        serif: ['Crimson Text', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
        display: ['EB Garamond', 'serif'],
      },
      backgroundImage: {
        'parchment-texture': "url('/textures/parchment.png')",
        'dark-texture': "url('/textures/dark-paper.png')",
      },
      boxShadow: {
        'book': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};

export default config;
