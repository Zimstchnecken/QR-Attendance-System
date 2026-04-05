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

      <View className="mb-4 flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <BarChart3 size={18} color={theme.colors.primary} />
            </View>
            <Text className="text-lg font-semibold text-textPrimary font-sans">Performance Snapshot</Text>
          </View>
          <Text className="mt-2 text-sm text-textSecondary font-sans">
            Dashboard is summary-only. Use other tabs for edits and actions.
          </Text>
        </View>
        <View className="rounded-full bg-primary/10 px-3 py-1">
          <Text className="text-xs font-semibold text-primary font-sans">Analytics</Text>
        </View>
      </View>

      <View className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
        <Text className="text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
          Check-ins By Class
        </Text>
        {classRows.map((row) => {
          const widthPercent = Math.max((row.value / maxClass) * 100, row.value > 0 ? 10 : 4);

          return (
            <View key={row.name} className="mt-3 flex-row items-center gap-2">
              <Text className="w-28 text-xs font-semibold text-textSecondary font-sans" numberOfLines={1}>
                {row.name}
              </Text>
              <View className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                <View className="h-full rounded-full bg-primary" style={{ width: `${widthPercent}%` }} />
              </View>
              <Text className="w-6 text-right text-xs font-semibold text-textPrimary font-sans">{row.value}</Text>
            </View>
          );
        })}
      </View>

      <View className="mt-4 rounded-2xl border border-success/20 bg-success/10 p-4">
        <Text className="text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
          Check-In Timeline
        </Text>
        <View className="mt-3 flex-row items-end justify-between">
          {timeRows.map((row) => {
            const height = row.value === 0 ? 8 : 12 + (row.value / maxTime) * 44;

            return (
              <View key={row.key} className="items-center">
                <View className="justify-end rounded-md bg-success/20 px-2" style={{ height: 60 }}>
                  <View className="w-4 rounded-sm bg-success" style={{ height }} />
                </View>
                <Text className="mt-2 text-xs font-semibold text-textSecondary font-sans">{row.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderColor: "rgba(15, 118, 110, 0.22)",
  },
  cardGlow: {
    position: "absolute",
    right: -30,
    top: -34,
    width: 114,
    height: 114,
    borderRadius: 999,
    backgroundColor: "rgba(15, 118, 110, 0.1)",
  },
});

