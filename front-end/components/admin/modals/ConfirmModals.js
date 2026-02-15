import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { AlertTriangle, Ban, X } from "lucide-react-native";
import { theme } from "../../../constants/theme";

export const InvalidateConfirmModal = ({ visible, sessionName, onCancel, onConfirm }) => {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
      <View className="w-full rounded-2xl bg-card p-6">
        <Text className="text-lg font-bold text-textPrimary font-sans mb-2">Invalidate Session</Text>
        <Text className="text-sm text-textSecondary font-sans mb-6">
          Are you sure you want to invalidate the QR for "{sessionName}"? This will close the session
          and prevent further check-ins.
        </Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onCancel}
            className="flex-1 rounded-2xl border border-border bg-card px-4 py-3"
          >
            <Text className="text-center text-base font-semibold text-textPrimary font-sans">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onConfirm}
            className="flex-1 rounded-2xl bg-danger px-4 py-3"
          >
            <Text className="text-center text-base font-semibold text-white font-sans">
              Invalidate
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const EmergencyConfirmModal = ({ visible, sessionName, onCancel, onConfirm }) => {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
      <View className="w-full rounded-2xl bg-card p-6">
        <View className="mb-3 flex-row items-center gap-2">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-danger/10">
            <AlertTriangle size={20} color={theme.colors.danger} />
          </View>
          <Text className="text-lg font-bold text-textPrimary font-sans">Send Emergency Alert</Text>
        </View>
        <Text className="text-sm text-textSecondary font-sans mb-6">
          This will immediately send an emergency alert to all parents in "{sessionName}". Are you sure
          you want to proceed?
        </Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onCancel}
            className="flex-1 rounded-2xl border border-border bg-card px-4 py-3"
          >
            <Text className="text-center text-base font-semibold text-textPrimary font-sans">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onConfirm}
            className="flex-1 rounded-2xl bg-danger px-4 py-3"
          >
            <Text className="text-center text-base font-semibold text-white font-sans">
              Send Alert
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const TeacherAbsentConfirmModal = ({ visible, sessionName, onCancel, onConfirm }) => {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
      <View className="w-full rounded-2xl bg-card p-6">
        <View className="mb-3 flex-row items-center gap-2">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Ban size={20} color={theme.colors.primary} />
          </View>
          <Text className="text-lg font-bold text-textPrimary font-sans">Notify Teacher Absence</Text>
        </View>
        <Text className="text-sm text-textSecondary font-sans mb-6">
          Send absence notification for "{sessionName}" to all parents? They will be informed about
          class arrangements.
        </Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onCancel}
            className="flex-1 rounded-2xl border border-border bg-card px-4 py-3"
          >
            <Text className="text-center text-base font-semibold text-textPrimary font-sans">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onConfirm}
            className="flex-1 rounded-2xl bg-primary px-4 py-3"
          >
            <Text className="text-center text-base font-semibold text-white font-sans">
              Send Notification
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const RemoveAttendanceModal = ({ visible, studentToRemove, onCancel, onConfirm }) => {
  if (!visible || !studentToRemove) return null;

  return (
    <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
      <View className="w-full rounded-2xl bg-card p-6">
        <View className="mb-3 flex-row items-center gap-2">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-danger/10">
            <X size={20} color={theme.colors.danger} />
          </View>
          <Text className="text-lg font-bold text-textPrimary font-sans">Remove Attendance</Text>
        </View>
        <Text className="text-sm text-textSecondary font-sans mb-6">
          Remove {studentToRemove.name}'s attendance record? This action cannot be undone.
        </Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onCancel}
            className="flex-1 rounded-2xl border border-border bg-card px-4 py-3"
          >
            <Text className="text-center text-base font-semibold text-textPrimary font-sans">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onConfirm}
            className="flex-1 rounded-2xl bg-danger px-4 py-3"
          >
            <Text className="text-center text-base font-semibold text-white font-sans">Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
