import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { theme } from "../../../constants/theme";

export const WarningModal = ({ visible, message, onClose }) => {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
      <View className="w-full rounded-2xl bg-card p-6">
        <View className="mb-3 flex-row items-center gap-2">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <AlertTriangle size={20} color={theme.colors.primary} />
          </View>
          <Text className="text-lg font-bold text-textPrimary font-sans">Missing Information</Text>
        </View>
        <Text className="text-sm text-textSecondary font-sans mb-6">{message}</Text>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onClose}
          className="rounded-2xl bg-primary px-4 py-3"
        >
          <Text className="text-center text-base font-semibold text-white font-sans">OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
