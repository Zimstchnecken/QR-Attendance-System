import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { AlertTriangle, Ban, CheckCircle, Mail } from "lucide-react-native";

export const TemplateSelectionModal = ({
  visible,
  onClose,
  onSelectEmail,
  onSelectEmergency,
  onSelectTeacherAbsent,
  onSelectClassEnded,
}) => {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
      <View className="w-full rounded-2xl bg-card p-6">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-textPrimary font-sans">Choose Template</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={onClose}>
            <Text className="text-2xl text-textSecondary font-sans">✕</Text>
          </TouchableOpacity>
        </View>
        <Text className="mb-4 text-sm text-textSecondary font-sans">Select which template you want to edit</Text>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onSelectEmail}
          className="mb-3 rounded-2xl bg-primary px-4 py-4"
        >
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Mail size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-white font-sans">Email Template</Text>
              <Text className="text-xs text-white/80 font-sans">Check-in notification to parents</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onSelectEmergency}
          className="mb-3 rounded-2xl bg-danger px-4 py-4"
        >
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <AlertTriangle size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-white font-sans">Emergency Alert</Text>
              <Text className="text-xs text-white/80 font-sans">Urgent notification template</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onSelectTeacherAbsent}
          className="mb-3 rounded-2xl bg-primary px-4 py-4"
        >
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Ban size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-white font-sans">Teacher Absent</Text>
              <Text className="text-xs text-white/80 font-sans">Absence notification template</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onSelectClassEnded}
          className="rounded-2xl bg-primary px-4 py-4"
        >
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <CheckCircle size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-white font-sans">Class Ended</Text>
              <Text className="text-xs text-white/80 font-sans">Class completion notification template</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
