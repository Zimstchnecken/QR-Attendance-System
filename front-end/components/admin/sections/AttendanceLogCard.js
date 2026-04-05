import React from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { ClipboardList, FileText, X } from "lucide-react-native";
import { GlassCard } from "../../";
import { theme } from "../../../constants/theme";

export const AttendanceLogCard = ({
  cardStyle,
  cardAnim,
  attendanceLog,
  logItemAnims,
  handleRemoveAttendance,
  setShowExportOptions,
  setShowListSummary,
  listItemStyle,
}) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;

  return (
    <GlassCard className="mb-6 overflow-hidden" style={[styles.card, cardStyle(cardAnim)]}>
      <View style={styles.cardGlow} />
      <View
        className="mb-3 flex-row items-center justify-between"
        style={isCompact ? styles.compactHeaderRow : null}
      >
        <View className="flex-1 pr-2" style={isCompact ? styles.compactHeaderTitle : null}>
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-success/10">
              <ClipboardList size={18} color={theme.colors.success} />
            </View>
            <Text className="text-lg font-semibold text-textPrimary font-sans">Attendance Log</Text>
          </View>
          <Text className="mt-2 text-sm text-textSecondary font-sans">
            Local records captured this session, ready for export and summary.
          </Text>
        </View>
        {attendanceLog.length > 0 && (
          <View className="rounded-lg bg-success/10 px-2 py-1" style={isCompact ? styles.compactCountBadge : null}>
            <Text className="text-xs font-semibold text-success font-sans">
              {attendanceLog.length} checked in
            </Text>
          </View>
        )}
      </View>
      {attendanceLog.map((row, index) => (
        <Animated.View
          key={row.id}
          className="mb-3 rounded-2xl border border-border bg-card p-4"
          style={[
            listItemStyle,
            styles.logRow,
            logItemAnims[index] ? cardStyle(logItemAnims[index]) : null,
          ]}
        >
          {String(row.id).startsWith("LIVE-") && (
            <View className="mb-2 self-start rounded-full bg-primary/10 px-2 py-1">
              <Text className="text-xs font-semibold uppercase tracking-wide text-primary font-sans">Live Scan</Text>
            </View>
          )}
          <View className="flex-row items-center justify-between" style={isCompact ? styles.compactLogRowTop : null}>
            <View className="flex-1">
              <Text className="text-base font-semibold text-textPrimary font-sans">{row.name}</Text>
              <Text className="mt-2 text-sm text-textSecondary font-sans">{row.className}</Text>
            </View>
            <View className="flex-row items-center gap-2" style={isCompact ? styles.compactLogMeta : null}>
              <Text className="text-xs font-semibold text-success font-sans">✓ {row.time}</Text>
              {!String(row.id).startsWith("LIVE-") && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleRemoveAttendance(row.id, row.name)}
                  className="ml-2 h-8 w-8 items-center justify-center rounded-lg bg-danger/10"
                  style={styles.removeButton}
                >
                  <X size={16} color={theme.colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      ))}
      <View className="mt-3 flex-row gap-3" style={isCompact ? styles.stackActionRow : null}>
        <TouchableOpacity
          activeOpacity={0.9}
          className="flex-1 rounded-2xl bg-primary px-4 py-4"
          onPress={() => setShowExportOptions(true)}
          style={[styles.actionButton, isCompact ? styles.fullWidthButton : null]}
        >
          <View className="flex-row items-center justify-center gap-2">
            <FileText size={18} color="#FFFFFF" />
            <Text className="text-center text-base font-semibold text-white font-sans">Export Data</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          className="flex-1 rounded-2xl border border-textPrimary bg-textPrimary px-4 py-4"
          onPress={() => setShowListSummary(true)}
          style={[styles.actionButton, isCompact ? styles.fullWidthButton : null]}
        >
          <View className="flex-row items-center justify-center gap-2">
            <ClipboardList size={18} color="#FFFFFF" />
            <Text className="text-center text-base font-semibold text-white font-sans">List Summary</Text>
          </View>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderColor: "rgba(22, 163, 74, 0.22)",
  },
  compactHeaderRow: {
    alignItems: "stretch",
  },
  compactHeaderTitle: {
    flexBasis: "100%",
    paddingRight: 0,
  },
  compactCountBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
  },
  compactLogRowTop: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  compactLogMeta: {
    marginTop: 8,
  },
  removeButton: {
    minHeight: 36,
    minWidth: 36,
    marginLeft: 0,
  },
  stackActionRow: {
    flexDirection: "column",
  },
  actionButton: {
    minHeight: 48,
    justifyContent: "center",
  },
  fullWidthButton: {
    width: "100%",
  },
  cardGlow: {
    position: "absolute",
    right: -30,
    top: -40,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: "rgba(22, 163, 74, 0.1)",
  },
  logRow: {
    borderColor: "rgba(229, 231, 235, 0.9)",
  },
});
