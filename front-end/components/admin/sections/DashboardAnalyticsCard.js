import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BarChart3 } from "lucide-react-native";
import { GlassCard } from "../../";
import { theme } from "../../../constants/theme";

const TIME_BUCKETS = [
  { key: "07", label: "7" },
  { key: "08", label: "8" },
  { key: "09", label: "9" },
  { key: "10", label: "10" },
  { key: "11", label: "11" },
];

const parseHour = (timeText) => {
  const match = String(timeText || "").match(/(\d{1,2}):\d{2}\s*(AM|PM)/i);

  if (!match) {
    return null;
  }

  let hour = parseInt(match[1], 10) % 12;
  const period = match[2].toUpperCase();

  if (period === "PM") {
    hour += 12;
  }

  return hour;
};

export const DashboardAnalyticsCard = ({ cardStyle, cardAnim, attendanceLog, selectedSession }) => {
  const classRows = useMemo(() => {
    const grouped = attendanceLog.reduce((acc, row) => {
      const key = row.className || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const rows = Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    if (rows.length === 0) {
      return [{ name: selectedSession.className, value: 0 }];
    }

    return rows;
  }, [attendanceLog, selectedSession.className]);

  const timeRows = useMemo(() => {
    const grouped = TIME_BUCKETS.reduce((acc, bucket) => {
      acc[bucket.key] = 0;
      return acc;
    }, {});

    attendanceLog.forEach((row) => {
      const hour = parseHour(row.time);

      if (hour === null) {
        return;
      }

      const key = String(hour).padStart(2, "0");

      if (grouped[key] !== undefined) {
        grouped[key] += 1;
      }
    });

    return TIME_BUCKETS.map((bucket) => ({
      ...bucket,
      value: grouped[bucket.key] || 0,
    }));
  }, [attendanceLog]);

  const maxClass = Math.max(...classRows.map((row) => row.value), 1);
  const maxTime = Math.max(...timeRows.map((row) => row.value), 1);

  return (
    <GlassCard className="mb-6 overflow-hidden" style={[styles.card, cardStyle(cardAnim)]}>
      <View style={styles.cardGlow} />

      <View className="mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-sm shadow-primary/10">
            <BarChart3 size={22} color={theme.colors.primary} />
          </View>
          <View>
            <Text className="text-xl font-bold text-textPrimary font-sans">Pedagogical Insights</Text>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-textSecondary font-sans">Engagement Analytics</Text>
          </View>
        </View>
        <View className="rounded-full bg-primary px-3 py-1 shadow-sm shadow-primary/20">
          <Text className="text-[10px] font-bold text-white font-sans uppercase">Real-time</Text>
        </View>
      </View>

      <View className="flex-col gap-6">
        {/* Class distribution */}
        <View className="rounded-3xl border border-border bg-surface/50 p-5">
          <View className="mb-5 flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-textSecondary font-sans">
              Enrollment by Session
            </Text>
            <View className="h-2 w-2 rounded-full bg-primary" />
          </View>
          
          <View className="gap-4">
            {classRows.map((row) => {
              const widthPercent = Math.max((row.value / maxClass) * 100, row.value > 0 ? 10 : 2);

              return (
                <View key={row.name}>
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text className="text-xs font-bold text-textPrimary font-sans" numberOfLines={1}>
                      {row.name}
                    </Text>
                    <Text className="text-xs font-bold text-primary font-sans">{row.value} Students</Text>
                  </View>
                  <View className="h-2.5 w-full overflow-hidden rounded-full bg-border/30">
                    <View 
                      className="h-full rounded-full bg-primary shadow-sm" 
                      style={{ width: `${widthPercent}%` }} 
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Time-based trend */}
        <View className="rounded-3xl border border-border bg-white p-5 shadow-sm shadow-black/5">
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-textSecondary font-sans">
              Peak Scan Activity
            </Text>
            <Text className="text-[10px] font-bold text-success font-sans">TODAY</Text>
          </View>

          <View className="flex-row items-end justify-between h-32 px-1">
            {timeRows.map((row) => {
              const barHeight = row.value === 0 ? 8 : (row.value / maxTime) * 100;
              const isActive = row.value === maxTime && maxTime > 0;

              return (
                <View key={row.key} className="items-center flex-1">
                  <View 
                    className={`w-6 rounded-t-xl transition-all duration-300 ${isActive ? "bg-success" : "bg-success/20"}`} 
                    style={{ height: `${barHeight}%`, minHeight: 6 }} 
                  />
                  <View className="mt-3 h-px w-full bg-border/40" />
                  <Text className={`mt-2 text-[10px] font-bold font-sans ${isActive ? "text-success" : "text-textSecondary"}`}>
                    {row.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View className="mt-6 flex-row items-center justify-center gap-2 rounded-2xl bg-surface/50 py-3 px-4 border border-border/50">
        <Text className="text-[11px] text-textSecondary font-sans text-center">
          Insights are refreshed automatically every 30 seconds.
        </Text>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderColor: "rgba(15, 118, 110, 0.15)",
  },
  cardGlow: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(15, 118, 110, 0.05)",
  },
});

