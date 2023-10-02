/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#005EA2",
        "primary-light": "#73B3E7",
        "primary-dark": "#1A4480"
      }
    },
  },
  plugins: [],
}

