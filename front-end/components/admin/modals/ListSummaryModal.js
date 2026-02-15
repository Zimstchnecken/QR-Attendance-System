import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ClipboardList } from "lucide-react-native";
import { theme } from "../../../constants/theme";

export const ListSummaryModal = ({ visible, attendanceLog, sessionName, onClose }) => {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
      <View className="w-full rounded-2xl bg-card p-6 max-h-96">
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1">
            <ClipboardList size={20} color={theme.colors.primary} />
            <Text className="text-lg font-bold text-textPrimary font-sans">Summary: {sessionName}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={onClose}>
            <Text className="text-2xl text-textSecondary font-sans">✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView className="mb-4">
          {attendanceLog.length > 0 ? (
            <View>
              {attendanceLog.map((row, index) => (
                <View key={row.id} className={`py-3 ${index > 0 ? "border-t border-border" : ""}`}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-textPrimary font-sans">{row.name}</Text>
                      <Text className="text-xs text-textSecondary font-sans">{row.className}</Text>
                    </View>
                    <Text className="text-xs font-semibold text-success font-sans">✓ {row.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text className="text-sm text-textSecondary font-sans text-center py-4">
              No students checked in yet
            </Text>
          )}
        </ScrollView>
        <View className="border-t border-border pt-3 mb-4">
          <Text className="text-sm font-semibold text-textSecondary font-sans">
            Total: {attendanceLog.length} students present
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.9} onPress={onClose} className="rounded-2xl bg-primary px-4 py-3">
          <Text className="text-center text-base font-semibold text-white font-sans">Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
