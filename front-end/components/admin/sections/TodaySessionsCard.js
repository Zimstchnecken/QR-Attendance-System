import React from "react";
import { Animated, Text } from "react-native";
import { GlassCard } from "../../";
import { sessionRows } from "../../../data/admin";

export const TodaySessionsCard = ({ cardStyle, cardAnim, sessionItemAnims, listItemStyle }) => (
  <GlassCard className="mb-6" style={cardStyle(cardAnim)}>
    <Text className="mb-3 text-lg font-semibold text-textPrimary font-sans">Today Sessions</Text>
    {sessionRows.map((row, index) => (
      <Animated.View
        key={row.id}
        className="mb-3 rounded-2xl border border-border bg-card p-4"
        style={[listItemStyle, cardStyle(sessionItemAnims[index])]}
      >
        <Text className="text-base font-semibold text-textPrimary font-sans">{row.className}</Text>
        <Text className="mt-2 text-sm text-textSecondary font-sans">
          Present: {row.present}/{row.total}
        </Text>
        <Text
          className={`mt-2 text-sm font-semibold font-sans ${
            row.status === "Active" ? "text-success" : "text-textSecondary"
          }`}
        >
          {row.status}
        </Text>
      </Animated.View>
    ))}
  </GlassCard>
);
