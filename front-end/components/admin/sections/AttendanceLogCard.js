import React from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
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
}) => (
  <GlassCard className="mb-6" style={cardStyle(cardAnim)}>
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-lg font-semibold text-textPrimary font-sans">Attendance Log (Local)</Text>
      {attendanceLog.length > 0 && (
        <View className="rounded-lg bg-success/10 px-2 py-1">
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
        style={[listItemStyle, cardStyle(logItemAnims[index])]}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base font-semibold text-textPrimary font-sans">{row.name}</Text>
            <Text className="mt-2 text-sm text-textSecondary font-sans">{row.className}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-xs font-semibold text-success font-sans">✓ {row.time}</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleRemoveAttendance(row.id, row.name)}
              className="ml-2 h-8 w-8 items-center justify-center rounded-lg bg-danger/10"
            >
              <X size={16} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    ))}
    <View className="mt-3 flex-row gap-3">
      <TouchableOpacity
        activeOpacity={0.9}
        className="flex-1 rounded-2xl bg-primary px-4 py-4"
        onPress={() => setShowExportOptions(true)}
      >
        <View className="flex-row items-center justify-center gap-2">
          <FileText size={18} color="#FFFFFF" />
          <Text className="text-center text-base font-semibold text-white font-sans">Export Data</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.9}
        className="flex-1 rounded-2xl bg-primary px-4 py-4"
        onPress={() => setShowListSummary(true)}
      >
        <View className="flex-row items-center justify-center gap-2">
          <ClipboardList size={18} color="#FFFFFF" />
          <Text className="text-center text-base font-semibold text-white font-sans">List Summary</Text>
        </View>
      </TouchableOpacity>
    </View>
  </GlassCard>
);
