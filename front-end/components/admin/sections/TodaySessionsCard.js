import React from "react";
import { Animated, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Clock3 } from "lucide-react-native";
import { GlassCard } from "../../";
import { theme } from "../../../constants/theme";
import { sessionRows } from "../../../data/admin";

export const TodaySessionsCard = ({ cardStyle, cardAnim, sessionItemAnims, listItemStyle }) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;

  return (
    <GlassCard className="mb-6 overflow-hidden" style={[styles.card, cardStyle(cardAnim)]}>
      <View style={styles.cardGlow} />
      <View
        className="mb-3 flex-row items-start justify-between gap-3"
        style={isCompact ? styles.compactHeaderRow : null}
      >
        <View className="flex-1" style={isCompact ? styles.compactHeaderTitle : null}>
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Clock3 size={18} color={theme.colors.primary} />
            </View>
            <Text className="text-lg font-semibold text-textPrimary font-sans">Today Sessions</Text>
          </View>
          <Text className="mt-2 text-sm text-textSecondary font-sans">
            Monitor class progress and live attendance across all sessions.
          </Text>
        </View>
        <View className="rounded-full bg-primary/10 px-3 py-1" style={isCompact ? styles.compactBadge : null}>
          <Text className="text-xs font-semibold text-primary font-sans">{sessionRows.length} classes</Text>
        </View>
      </View>
      {sessionRows.map((row, index) => {
        const completion = Math.round((row.present / row.total) * 100);

        return (
          <Animated.View
            key={row.id}
            className="mb-3 rounded-2xl border border-border bg-card p-4"
            style={[listItemStyle, styles.sessionRow, cardStyle(sessionItemAnims[index])]}
          >
            <View
              className="flex-row items-center justify-between"
              style={isCompact ? styles.compactSessionHeaderRow : null}
            >
              <Text className="text-base font-semibold text-textPrimary font-sans">{row.className}</Text>
              <View
                className={`rounded-full px-2 py-1 ${row.status === "Active" ? "bg-success/10" : "bg-surface"}`}
                style={isCompact ? styles.compactStatusBadge : null}
              >
                <Text
                  className={`text-xs font-semibold font-sans ${
                    row.status === "Active" ? "text-success" : "text-textSecondary"
                  }`}
                >
                  {row.status}
                </Text>
              </View>
            </View>
            <Text className="mt-2 text-sm text-textSecondary font-sans">
              {row.present}/{row.total} present ({completion}%)
            </Text>
            <View className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
              <View
                className={`${row.status === "Active" ? "bg-success" : "bg-primary"} h-full rounded-full`}
                style={{ width: `${completion}%` }}
              />
            </View>
          </Animated.View>
        );
      })}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderColor: "rgba(15, 118, 110, 0.2)",
  },
  compactHeaderRow: {
    alignItems: "stretch",
  },
  compactHeaderTitle: {
    flexBasis: "100%",
  },
  compactBadge: {
    alignSelf: "flex-start",
  },
  compactSessionHeaderRow: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  compactStatusBadge: {
    marginTop: 6,
  },
  cardGlow: {
    position: "absolute",
    right: -36,
    top: -42,
    width: 122,
    height: 122,
    borderRadius: 999,
    backgroundColor: "rgba(15, 118, 110, 0.1)",
  },
  sessionRow: {
    borderColor: "rgba(229, 231, 235, 0.9)",
  },
});

