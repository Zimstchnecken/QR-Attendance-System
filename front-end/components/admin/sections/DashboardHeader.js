import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { LogOut } from "lucide-react-native";
import { theme } from "../../../constants/theme";

export const DashboardHeader = ({ onLogout }) => (
  <View className="mb-6 flex-row flex-wrap items-start justify-between gap-3">
    <View className="flex-1 pr-2">
      <Text className="text-2xl font-bold text-textPrimary font-sans">Teacher Dashboard</Text>
      <Text className="mt-2 text-sm text-textSecondary font-sans">
        Manage sessions, students, and attendance exports
      </Text>
    </View>
    <TouchableOpacity
      onPress={onLogout}
      activeOpacity={0.9}
      className="self-start rounded-2xl border border-border bg-card px-4 py-4"
    >
      <View className="flex-row items-center gap-2">
        <LogOut size={18} color={theme.colors.textSecondary} />
        <Text className="text-xs font-semibold text-textSecondary font-sans">Log out</Text>
      </View>
    </TouchableOpacity>
  </View>
);
