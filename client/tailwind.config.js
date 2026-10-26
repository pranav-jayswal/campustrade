/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Calm, Sophisticated Collegiate Palette (Soothing Ocean Blues, Soft Slates, Crisp Whites)
        neo: {
          lime: '#2563EB',    // Primary Calm Ocean Blue (replaces glaring acid lime)
          pink: '#0284C7',    // Refined Cerulean Sky Accent (replaces hot fluorescent magenta)
          purple: '#1E293B',  // Deep Slate Navy for badges and containers
          cyan: '#0EA5E9',    // Soft Cyan Accent
          yellow: '#F59E0B',  // Warm Amber for ratings
          cream: '#F8FAFC',   // Ultra-calm Slate-50 background (replaces yellowish tint)
          dark: '#0F172A',    // Refined Slate-900 text
        },
        ink: '#0F172A',       // Slate-900
        slate: {
          850: '#172033',     // Refined Deep Slate Navy (dark card backgrounds)
        },
        accent: {
          DEFAULT: '#2563EB', // Ocean Blue
          dark: '#1D4ED8',    // Deep Blue
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Smooth, modern, calm elevation (replaces harsh solid black offset shadows)
        'neo-sm': '0 1px 2px 0 rgb(15 23 42 / 0.06), 0 1px 1px 0 rgb(15 23 42 / 0.04)',
        'neo': '0 4px 6px -1px rgb(15 23 42 / 0.07), 0 2px 4px -2px rgb(15 23 42 / 0.05)',
        'neo-lg': '0 10px 15px -3px rgb(15 23 42 / 0.08), 0 4px 6px -4px rgb(15 23 42 / 0.04)',
        'neo-xl': '0 20px 25px -5px rgb(15 23 42 / 0.08), 0 8px 10px -6px rgb(15 23 42 / 0.03)',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};
