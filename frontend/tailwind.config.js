/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0b',
        surface: '#121214',
        'surface-hover': '#1c1c1f',
        primary: '#3b82f6',
        'primary-hover': '#2563eb',
        danger: '#ef4444',
        success: '#22c55e',
        muted: '#a1a1aa',
        border: '#27272a'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
