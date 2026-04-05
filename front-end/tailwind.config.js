/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.js", "./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0F766E",
        background: "#F8F4EA",
        card: "#FFFCF8",
        textPrimary: "#1C2430",
        textSecondary: "#5D6878",
        success: "#1F9D55",
        danger: "#C2412D",
        border: "#E4DBCC",
        surface: "#F1E8D9",
      },
      fontFamily: {
        sans: ["Avenir Next", "Nunito", "System"],
      },
      boxShadow: {
        card: "0 10px 24px rgba(17, 24, 39, 0.08)",
      },
    },
  },
  plugins: [],
};
