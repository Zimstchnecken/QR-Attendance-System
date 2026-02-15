import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { FileText } from "lucide-react-native";
import { theme } from "../../../constants/theme";

export const ExportOptionsModal = ({ visible, attendanceCount, onClose, onExport }) => {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
      <View className="w-full rounded-2xl bg-card p-6">
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <FileText size={20} color={theme.colors.primary} />
            <Text className="text-lg font-bold text-textPrimary font-sans">Export Format</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={onClose}>
            <Text className="text-2xl text-textSecondary font-sans">✕</Text>
          </TouchableOpacity>
        </View>
        <Text className="mb-4 text-sm text-textSecondary font-sans">
          Choose your preferred export format for {attendanceCount} attendance records
        </Text>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onExport("csv")}
          className="mb-3 rounded-2xl bg-primary px-4 py-4"
        >
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <FileText size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-white font-sans">CSV File</Text>
              <Text className="text-xs text-white/80 font-sans">Comma-separated values (.csv)</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onExport("excel")}
          className="mb-3 rounded-2xl bg-success px-4 py-4"
        >
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <FileText size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-white font-sans">Excel Spreadsheet</Text>
              <Text className="text-xs text-white/80 font-sans">Microsoft Excel format (.xlsx)</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onExport("pdf")}
          className="rounded-2xl bg-danger px-4 py-4"
        >
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <FileText size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-white font-sans">PDF Document</Text>
              <Text className="text-xs text-white/80 font-sans">Portable document format (.pdf)</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
