import { View } from "react-native";

export default function GlassCard({ children, className = "" }) {
  return (
    <View
      className={`rounded-2xl border border-border bg-card p-4 shadow-card ${className}`}
    >
      {children}
    </View>
  );
}
