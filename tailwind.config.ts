import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        islamic: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          700: '#15803d',
          900: '#14532d', // Dark Green
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b', // Accent Gold
        }
      },
      fontFamily: {
        arab: ['"Amiri"', '"Scheherazade New"', 'serif'],
      }
    },
  },
  plugins: [],
}
export default config