/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.js", "./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f7ff",
          100: "#e9edff",
          200: "#d6defa",
          400: "#9fb0e6",
          500: "#7c90d1",
          600: "#6578b8",
          700: "#4f5f9c",
        },
      },
      boxShadow: {
        card: "0 8px 24px rgba(15, 23, 42, 0.15)",
      },
    },
  },
  plugins: [],
};
