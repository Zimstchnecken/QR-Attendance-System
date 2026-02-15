import { Animated, StyleSheet } from "react-native";
import { theme } from "../../constants/theme";

export default function GlassCard({ children, className = "", style }) {
  return (
    <Animated.View
      className={`rounded-2xl border border-border bg-card p-4 ${className}`}
      style={[styles.card, style]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderColor: theme.colors.border,
    ...theme.shadow.card,
  },
});
