import React from "react";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { CalendarCheck, ClipboardCheck, LogOut, Users } from "lucide-react-native";
import { theme } from "../../../constants/theme";

export const DashboardHeader = ({ onLogout }) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;

  return (
    <View className="mb-6 overflow-hidden rounded-3xl border border-border bg-card" style={styles.bannerCard}>
      <View style={styles.bannerGlowTop} />
      <View style={styles.bannerGlowBottom} />

      <View className="px-5 pb-5 pt-6" style={isCompact ? styles.bannerPaddingCompact : null}>
        <View className="mb-4 self-start rounded-full border border-white/25 bg-white/20 px-3 py-1">
          <Text className="text-xs font-semibold uppercase tracking-widest text-white font-sans">
            ZapRoll Command Center
          </Text>
        </View>

        <View className="mb-4 flex-row flex-wrap items-start justify-between gap-3" style={isCompact ? styles.compactHeaderRow : null}>
          <View className="flex-1 pr-2" style={isCompact ? styles.compactTitleBlock : null}>
            <Text className="text-3xl font-bold text-white font-sans" style={isCompact ? styles.compactTitleText : null}>
              ZapRoll Teacher Dashboard
            </Text>
            <Text className="mt-2 text-sm text-white/90 font-sans">
              Manage sessions, students, roll calls, and parent communication from one place.
            </Text>
          </View>
          <TouchableOpacity
            onPress={onLogout}
            activeOpacity={0.9}
            className="self-start rounded-2xl border border-white/25 bg-white/20 px-4 py-4"
            style={[styles.actionButton, isCompact ? styles.compactLogoutButton : null]}
          >
            <View className="flex-row items-center gap-2">
              <LogOut size={18} color="#FFFFFF" />
              <Text className="text-xs font-semibold text-white font-sans">Log out</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap gap-2" style={isCompact ? styles.compactChipWrap : null}>
          <View className="flex-row items-center gap-2 rounded-full bg-white/20 px-3 py-2">
            <CalendarCheck size={15} color="#FFFFFF" />
            <Text className="text-xs font-semibold text-white font-sans">Today ready</Text>
          </View>
          <View className="flex-row items-center gap-2 rounded-full bg-white/20 px-3 py-2">
            <Users size={15} color="#FFFFFF" />
            <Text className="text-xs font-semibold text-white font-sans">Student management</Text>
          </View>
          <View className="flex-row items-center gap-2 rounded-full bg-white/20 px-3 py-2">
            <ClipboardCheck size={15} color="#FFFFFF" />
            <Text className="text-xs font-semibold text-white font-sans">Exports in one tap</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerCard: {
    backgroundColor: theme.colors.primary,
    ...theme.shadow.card,
  },
  bannerPaddingCompact: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  compactHeaderRow: {
    alignItems: "stretch",
  },
  compactTitleBlock: {
    flexBasis: "100%",
    paddingRight: 0,
  },
  compactTitleText: {
    fontSize: 28,
    lineHeight: 32,
  },
  actionButton: {
    minHeight: 48,
    justifyContent: "center",
  },
  compactLogoutButton: {
    alignSelf: "stretch",
    alignItems: "center",
  },
  compactChipWrap: {
    rowGap: theme.spacing.xs,
  },
  bannerGlowTop: {
    position: "absolute",
    right: -24,
    top: -42,
    width: 164,
    height: 164,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  bannerGlowBottom: {
    position: "absolute",
    left: -54,
    bottom: -64,
    width: 178,
    height: 178,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
});
