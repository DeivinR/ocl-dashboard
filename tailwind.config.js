/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocl: {
          primary: '#003366',
          secondary: '#004990',
          dark: '#001a33',
          hover: '#002244',
        },
        brand: {
          bg: '#F1F5F9',
          card: '#FFFFFF',
          text: '#1E293B',
          accent: '#F59E0B',
          success: '#10B981',
          danger: '#EF4444',
        },
      },
    },
  },
  plugins: [],
}