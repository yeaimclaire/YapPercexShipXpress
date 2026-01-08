/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff5f7',
          100: '#ffe4ec',
          200: '#fecdd9',
          300: '#fda4c0',
          400: '#fb7aa8',
          500: '#f25f95',
          600: '#e84a86',
          700: '#cc2f6f',
          800: '#a8255a',
          900: '#7e1f47',
        },
      },
    },
  },
  plugins: [],
}
