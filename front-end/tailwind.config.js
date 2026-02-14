/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.js", "./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#4F6BED",
        background: "#F9FAFB",
        card: "#FFFFFF",
        textPrimary: "#111827",
        textSecondary: "#6B7280",
        success: "#16A34A",
        danger: "#DC2626",
        border: "#E5E7EB",
        surface: "#F3F4F6",
      },
      fontFamily: {
        sans: ["Inter", "System"],
      },
      boxShadow: {
        card: "0 10px 24px rgba(17, 24, 39, 0.08)",
      },
    },
  },
  plugins: [],
};
