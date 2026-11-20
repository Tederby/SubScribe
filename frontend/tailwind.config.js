/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ['"Barlow"', "system-ui", "sans-serif"],
      },
      colors: {
        chassis: {
          base: "#141517",
          frame: "#0E0F11",
          surface: "#181A1D",
          border: "#26282B",
          muted: "#8E9094",
        },
        safety: {
          orange: "#FF4F00",
          yellow: "#DFFF00",
        },
        led: {
          green: "#00E676",
          orange: "#FF4F00",
          red: "#FF3344",
        },
      },
    },
  },
  plugins: [],
};
