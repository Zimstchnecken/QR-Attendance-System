import { View } from "react-native";

export default function GlassCard({ children, className = "" }) {
  return (
    <View
      className={`rounded-3xl border border-white/60 bg-slate-50/90 p-4 shadow-card ${className}`}
    >
      {children}
    </View>
  );
}
