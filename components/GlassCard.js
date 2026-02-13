import { View } from "react-native";

export default function GlassCard({ children, className = "" }) {
  return (
    <View
      className={`rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-card ${className}`}
    >
      {children}
    </View>
  );
}
