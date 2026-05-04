import React from "react";
import { Animated, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Clock3 } from "lucide-react-native";
import { GlassCard } from "../../";
import { theme } from "../../../constants/theme";

export const TodaySessionsCard = ({ cardStyle, cardAnim, sessions, sessionItemAnims, listItemStyle }) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;

  return (
    <GlassCard className="mb-6 overflow-hidden" style={[styles.card, cardStyle(cardAnim)]}>
      <View style={styles.cardGlow} />
      
      {/* Header */}
      <View className="mb-5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <Clock3 size={18} color={theme.colors.primary} />
          </View>
          <View>
            <Text className="text-lg font-bold text-textPrimary font-sans">Today's Activity</Text>
            <Text className="text-[11px] text-textSecondary font-sans">Real-time attendance overview</Text>
          </View>
        </View>
        <View className="rounded-full bg-primary/10 px-3 py-1 border border-primary/20">
          <Text className="text-[10px] font-bold uppercase text-primary font-sans">{(sessions || []).length} Classes</Text>
        </View>
      </View>

      {(sessions || []).map((row, index) => {
        const total = row.total || 0;
        const present = row.present || 0;
        const completion = total > 0 ? Math.round((present / total) * 100) : 0;
        const isActive = row.status === "Active";

        return (
          <Animated.View
            key={row.id}
            className={`mb-4 rounded-3xl border p-5 ${isActive ? "border-success/20 bg-success/5" : "border-border/50 bg-card/40"}`}
            style={[listItemStyle, styles.sessionRow, cardStyle(sessionItemAnims[index])]}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1 pr-2">
                <Text className="text-base font-bold text-textPrimary font-sans" numberOfLines={1}>{row.className}</Text>
                <Text className="text-[10px] text-textSecondary font-sans mt-0.5">Session ID: {row.id}</Text>
              </View>
              <View className={`rounded-full px-2.5 py-1 flex-row items-center gap-1.5 ${isActive ? "bg-success/10" : "bg-surface"}`}>
                {isActive && <View className="h-1.5 w-1.5 rounded-full bg-success" />}
                <Text className={`text-[10px] font-bold font-sans uppercase ${isActive ? "text-success" : "text-textSecondary"}`}>
                  {row.status}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-end mb-2">
              <View>
                <Text className="text-xl font-bold text-textPrimary font-sans">{present}</Text>
                <Text className="text-[10px] uppercase text-textSecondary font-sans">Present Students</Text>
              </View>
              <View className="items-end">
                <Text className="text-sm font-bold text-textPrimary font-sans">{completion}%</Text>
                <Text className="text-[10px] uppercase text-textSecondary font-sans">Completion</Text>
              </View>
            </View>

            <View className="h-2 overflow-hidden rounded-full bg-surface-dark/10 border border-border/10">
              <View
                className={`${isActive ? "bg-success" : "bg-primary/50"} h-full rounded-full`}
                style={{ width: `${completion}%` }}
              />
            </View>
          </Animated.View>
        );
      })}

      {(sessions || []).length === 0 && (
        <View className="py-8 items-center bg-surface/20 rounded-3xl border border-dashed border-border/50">
          <Clock3 size={24} color={theme.colors.textSecondary} />
          <Text className="mt-3 text-sm text-textSecondary font-sans">No sessions scheduled for today.</Text>
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderColor: "rgba(15, 118, 110, 0.15)",
  },
  cardGlow: {
    position: "absolute", right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(15, 118, 110, 0.08)",
  },
  sessionRow: {
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1,
  },
});

