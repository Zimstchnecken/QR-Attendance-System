import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export const TeacherAbsentTemplateModal = ({ visible, value, onChange, onCancel, onSave }) => {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
      <View className="w-full rounded-2xl bg-card p-6">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-textPrimary font-sans">Teacher Absent</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={onCancel}>
            <Text className="text-2xl text-textSecondary font-sans">✕</Text>
          </TouchableOpacity>
        </View>
        <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
          Notification Message
        </Text>
        <Text className="mb-4 text-xs text-textSecondary font-sans">Use placeholder: {'{class}'}</Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Enter teacher absent notification"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={8}
          className="mb-4 rounded-2xl border border-border bg-background px-3 py-3 text-sm text-textPrimary font-sans"
          style={{ textAlignVertical: "top" }}
        />
        <View className="flex-row gap-3">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onCancel}
            className="flex-1 rounded-2xl border border-border bg-card px-4 py-3"
          >
            <Text className="text-center text-base font-semibold text-textPrimary font-sans">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onSave}
            className="flex-1 rounded-2xl bg-primary px-4 py-3"
          >
            <Text className="text-center text-base font-semibold text-white font-sans">Save Template</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
