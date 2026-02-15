import React from "react";
import { Animated, Text, View } from "react-native";
import { CheckCircle } from "lucide-react-native";
import { theme } from "../../../constants/theme";

export const SuccessToast = ({ visible, successAnim, message }) => {
  if (!visible) return null;

  return (
    <Animated.View
      className="pointer-events-none absolute inset-0 justify-start items-center pt-12"
      style={{ opacity: successAnim }}
    >
      <View
        className="mx-6 w-full rounded-2xl bg-card border border-success/20 px-5 py-4 shadow-lg"
        style={{
          shadowColor: theme.colors.success,
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <CheckCircle size={24} color={theme.colors.success} strokeWidth={2.5} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-success font-sans">{message}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};
