/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0ea5e9',
          600: '#0ea5e9',
          700: '#0284c7',
        },
        accent: {
          DEFAULT: '#f97316',
          500: '#f97316',
        },
        surface: '#ffffff',
        'surface-2': '#f8fafc',
        // light, bright gray scale used across the UI so existing classes like bg-gray-900
        // map to a light surface without needing to change markup across the project
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#334155',
          800: '#1f2937',
          900: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
