import React from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Users, QrCode, TrendingUp } from "lucide-react-native";
import { GlassCard } from "../../";
import { theme } from "../../../constants/theme";

export const SummaryCards = ({ cardStyle, cardAnims, sessions, attendanceLog }) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const activeCount = (sessions || []).filter((s) => s.status === "Active").length;
  const checkedInCount = (attendanceLog || []).length;
  const totalStudents = 32; // Placeholder for total students in current session
  const attendanceRate = totalStudents > 0 ? Math.round((checkedInCount / totalStudents) * 100) : 0;

  return (
    <View className="mb-8 flex-row gap-4" style={isCompact ? styles.stackCards : null}>
      {/* Active Sessions Card */}
      <GlassCard className="flex-1 overflow-hidden p-5" style={[styles.card, styles.primaryCard, cardStyle(cardAnims[0])]}>
        <View style={styles.primaryGlow} />
        <View className="flex-row items-center justify-between mb-4">
           <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <QrCode size={20} color={theme.colors.primary} />
           </View>
           <View className="rounded-full bg-primary/10 px-2 py-0.5">
              <Text className="text-[9px] font-bold text-primary uppercase">Live</Text>
           </View>
        </View>
        <Text className="text-3xl font-bold text-textPrimary font-sans">{activeCount}</Text>
        <Text className="text-[10px] font-bold uppercase tracking-widest text-textSecondary font-sans mt-1">Active Classes</Text>
        <View className="mt-4 h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
           <View className="h-full bg-primary rounded-full" style={{ width: `${(activeCount / 5) * 100}%` }} />
        </View>
      </GlassCard>

      {/* Checked-In Card */}
      <GlassCard className="flex-1 overflow-hidden p-5" style={[styles.card, styles.successCard, cardStyle(cardAnims[1])]}>
        <View style={styles.successGlow} />
        <View className="flex-row items-center justify-between mb-4">
           <View className="h-10 w-10 items-center justify-center rounded-2xl bg-success/10 border border-success/20">
              <Users size={20} color={theme.colors.success} />
           </View>
           <View className="rounded-full bg-success/10 px-2 py-0.5">
              <Text className="text-[9px] font-bold text-success uppercase">Today</Text>
           </View>
        </View>
        <Text className="text-3xl font-bold text-textPrimary font-sans">{checkedInCount}</Text>
        <Text className="text-[10px] font-bold uppercase tracking-widest text-textSecondary font-sans mt-1">Present Now</Text>
        <View className="mt-4 h-1.5 w-full bg-success/10 rounded-full overflow-hidden">
           <View className="h-full bg-success rounded-full" style={{ width: `${attendanceRate}%` }} />
        </View>
      </GlassCard>

      {/* Performance Card */}
      {!isCompact && (
        <GlassCard className="flex-1 overflow-hidden p-5" style={[styles.card, styles.warningCard, cardStyle(cardAnims[2] || cardAnims[1])]}>
          <View style={styles.warningGlow} />
          <View className="flex-row items-center justify-between mb-4">
             <View className="h-10 w-10 items-center justify-center rounded-2xl bg-warning/10 border border-warning/20">
                <TrendingUp size={20} color={theme.colors.warning} />
             </View>
             <View className="rounded-full bg-warning/10 px-2 py-0.5">
                <Text className="text-[9px] font-bold text-warning uppercase">Trend</Text>
             </View>
          </View>
          <Text className="text-3xl font-bold text-textPrimary font-sans">{attendanceRate}%</Text>
          <Text className="text-[10px] font-bold uppercase tracking-widest text-textSecondary font-sans mt-1">Roll Rate</Text>
          <View className="mt-4 h-1.5 w-full bg-warning/10 rounded-full overflow-hidden">
             <View className="h-full bg-warning rounded-full" style={{ width: `${attendanceRate}%` }} />
          </View>
        </GlassCard>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  stackCards: {
    flexDirection: "column",
  },
  card: {
    minHeight: 160,
  },
  primaryCard: { borderColor: "rgba(15, 118, 110, 0.15)" },
  primaryGlow: {
    position: "absolute", right: -30, top: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(15, 118, 110, 0.08)",
  },
  successCard: { borderColor: "rgba(22, 163, 74, 0.15)" },
  successGlow: {
    position: "absolute", right: -30, top: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(22, 163, 74, 0.08)",
  },
  warningCard: { borderColor: "rgba(245, 158, 11, 0.15)" },
  warningGlow: {
    position: "absolute", right: -30, top: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(245, 158, 11, 0.08)",
  },
});

