import React from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { CheckCircle, QrCode } from "lucide-react-native";
import { GlassCard } from "../../";
import { theme } from "../../../constants/theme";

export const SummaryCards = ({ cardStyle, cardAnims }) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;

  return (
    <View className="mb-6 flex-row gap-3" style={isCompact ? styles.stackCards : null}>
      <GlassCard className="flex-1 overflow-hidden" style={[styles.primaryCard, cardStyle(cardAnims[0])]}>
        <View style={styles.primaryGlow} />
        <View className="flex-row items-center gap-2">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/20">
            <QrCode size={18} color={theme.colors.primary} />
          </View>
          <Text
            className="text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Active sessions
          </Text>
        </View>
        <Text className="mt-3 text-4xl font-bold text-textPrimary font-sans" style={isCompact ? styles.compactStat : null}>
          02
        </Text>
        <Text className="text-sm text-textSecondary font-sans">Live QR sessions right now</Text>
        <View className="mt-3 self-start rounded-full bg-primary/10 px-3 py-1">
          <Text className="text-xs font-semibold text-primary font-sans">Stable for current class window</Text>
        </View>
      </GlassCard>
      <GlassCard className="flex-1 overflow-hidden" style={[styles.successCard, cardStyle(cardAnims[1])]}>
        <View style={styles.successGlow} />
        <View className="flex-row items-center gap-2">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-success/20">
            <CheckCircle size={18} color={theme.colors.success} />
          </View>
          <Text
            className="text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Notified
          </Text>
        </View>
        <Text className="mt-3 text-4xl font-bold text-textPrimary font-sans" style={isCompact ? styles.compactStat : null}>
          97
        </Text>
        <Text className="text-sm text-textSecondary font-sans">Parents notified</Text>
        <View className="mt-3 self-start rounded-full bg-success/10 px-3 py-1">
          <Text className="text-xs font-semibold text-success font-sans">Message delivery rate healthy</Text>
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  stackCards: {
    flexDirection: "column",
  },
  compactStat: {
    fontSize: 32,
    lineHeight: 36,
  },
  primaryCard: {
    borderColor: "rgba(15, 118, 110, 0.22)",
  },
  primaryGlow: {
    position: "absolute",
    right: -28,
    top: -30,
    width: 108,
    height: 108,
    borderRadius: 999,
    backgroundColor: "rgba(15, 118, 110, 0.11)",
  },
  successCard: {
    borderColor: "rgba(22, 163, 74, 0.26)",
  },
  successGlow: {
    position: "absolute",
    right: -28,
    top: -30,
    width: 108,
    height: 108,
    borderRadius: 999,
    backgroundColor: "rgba(22, 163, 74, 0.10)",
  },
});

