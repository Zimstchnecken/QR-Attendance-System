import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { AlertTriangle, Ban, Mail } from "lucide-react-native";
import { GlassCard } from "../../";
import { theme } from "../../../constants/theme";

export const EmailAutomationCard = ({ cardStyle, cardAnim, setShowTemplateSelection, handleEmergencyAlert, handleTeacherAbsent }) => (
  <GlassCard style={cardStyle(cardAnim)}>
    <View className="mb-3 flex-row items-center gap-2">
      <Mail size={20} color={theme.colors.primary} />
      <Text className="text-lg font-semibold text-textPrimary font-sans">Email Automation</Text>
    </View>
    <Text className="text-sm text-textSecondary font-sans">
      Parent notifications sent automatically after check-in.
    </Text>
    <TouchableOpacity
      activeOpacity={0.9}
      className="mt-4 rounded-2xl bg-primary px-4 py-4"
      onPress={() => setShowTemplateSelection(true)}
    >
      <View className="flex-row items-center justify-center gap-2">
        <Mail size={18} color="#FFFFFF" />
        <Text className="text-center text-base font-semibold text-white font-sans">Edit Templates</Text>
      </View>
    </TouchableOpacity>
    <View className="mt-3 flex-row gap-3">
      <TouchableOpacity
        activeOpacity={0.9}
        className="flex-1 rounded-2xl bg-danger px-4 py-4"
        onPress={handleEmergencyAlert}
      >
        <View className="flex-row items-center justify-center gap-2">
          <AlertTriangle size={18} color="#FFFFFF" />
          <Text className="text-center text-base font-semibold text-white font-sans">Emergency Alert</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.9}
        className="flex-1 rounded-2xl bg-primary px-4 py-4"
        onPress={handleTeacherAbsent}
      >
        <View className="flex-row items-center justify-center gap-2">
          <Ban size={18} color="#FFFFFF" />
          <Text className="text-center text-base font-semibold text-white font-sans">Teacher Absent</Text>
        </View>
      </TouchableOpacity>
    </View>
  </GlassCard>
);
