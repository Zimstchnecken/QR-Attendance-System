import React from "react";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { AlertTriangle, Ban, CheckCircle, Mail } from "lucide-react-native";
import { GlassCard } from "../../";
import { theme } from "../../../constants/theme";

export const EmailAutomationCard = ({
  cardStyle,
  cardAnim,
  setShowTemplateSelection,
  handleEmergencyAlert,
  handleTeacherAbsent,
  handleClassEnded,
}) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;

  return (
    <GlassCard className="overflow-hidden" style={[styles.card, cardStyle(cardAnim)]}>
      <View style={styles.cardGlow} />
      <View
        className="mb-3 flex-row items-start justify-between gap-3"
        style={isCompact ? styles.compactHeaderRow : null}
      >
        <View className="flex-1" style={isCompact ? styles.compactHeaderTitle : null}>
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Mail size={20} color={theme.colors.primary} />
            </View>
            <Text className="text-lg font-semibold text-textPrimary font-sans">Email Automation</Text>
          </View>
          <Text className="mt-2 text-sm text-textSecondary font-sans">
            Templates and critical parent notifications managed from one panel.
          </Text>
        </View>
        <View className="rounded-full bg-primary/10 px-3 py-1" style={isCompact ? styles.compactBadge : null}>
          <Text className="text-xs font-semibold text-primary font-sans">Messaging Hub</Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        className="mt-4 rounded-2xl bg-primary px-4 py-4"
        onPress={() => setShowTemplateSelection(true)}
        style={styles.actionButton}
      >
        <View className="flex-row items-center justify-center gap-2">
          <Mail size={18} color="#FFFFFF" />
          <Text className="text-center text-base font-semibold text-white font-sans">Edit Templates</Text>
        </View>
      </TouchableOpacity>
      <View className="mt-3 flex-row gap-3" style={isCompact ? styles.stackActionRow : null}>
        <TouchableOpacity
          activeOpacity={0.9}
          className="flex-1 rounded-2xl bg-danger px-4 py-4"
          onPress={handleEmergencyAlert}
          style={[styles.actionButton, isCompact ? styles.fullWidthButton : null]}
        >
          <View className="flex-row items-center justify-center gap-2">
            <AlertTriangle size={18} color="#FFFFFF" />
            <Text className="text-center text-base font-semibold text-white font-sans">Emergency Alert</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          className="flex-1 rounded-2xl border border-primary bg-primary/90 px-4 py-4"
          onPress={handleTeacherAbsent}
          style={[styles.actionButton, isCompact ? styles.fullWidthButton : null]}
        >
          <View className="flex-row items-center justify-center gap-2">
            <Ban size={18} color="#FFFFFF" />
            <Text className="text-center text-base font-semibold text-white font-sans">Teacher Absent</Text>
          </View>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        activeOpacity={0.9}
        className="mt-3 rounded-2xl border border-textPrimary bg-textPrimary px-4 py-4"
        onPress={handleClassEnded}
        style={styles.actionButton}
      >
        <View className="flex-row items-center justify-center gap-2">
          <CheckCircle size={18} color="#FFFFFF" />
          <Text className="text-center text-base font-semibold text-white font-sans">Class Ended</Text>
        </View>
      </TouchableOpacity>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderColor: "rgba(15, 118, 110, 0.22)",
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
    right: -28,
    top: -36,
    width: 114,
    height: 114,
    borderRadius: 999,
    backgroundColor: "rgba(15, 118, 110, 0.1)",
  },
});

