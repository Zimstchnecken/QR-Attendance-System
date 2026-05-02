import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock,
  Info,
  ShieldAlert,
  Trash2,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassCard, ScreenBackground } from "../components";
import { theme } from "../constants/theme";

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "attendance",
    title: "Attendance Confirmed",
    message: "Your attendance for Grade 12 - Advanced Physics has been verified.",
    time: "10 mins ago",
    status: "success",
    icon: CheckCircle2,
  },
  {
    id: "2",
    type: "alert",
    title: "Late Arrival Detected",
    message: "You were marked late for Mathematics. Policy requires arrival within 10 mins.",
    time: "2 hours ago",
    status: "warning",
    icon: Clock,
  },
  {
    id: "3",
    type: "system",
    title: "System Maintenance",
    message: "ZapRoll will be offline for scheduled maintenance tomorrow at 2:00 AM.",
    time: "5 hours ago",
    status: "info",
    icon: Info,
  },
  {
    id: "4",
    type: "security",
    title: "New Login Detected",
    message: "Your account was accessed from a new iPhone 15 Pro in Manila, PH.",
    time: "Yesterday",
    status: "danger",
    icon: ShieldAlert,
  },
];

export default function NotificationsScreen({ onBack }) {
  const getStatusColors = (status) => {
    switch (status) {
      case "success": return { bg: "bg-success/10", text: "text-success", border: "border-success/20", icon: theme.colors.success };
      case "warning": return { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20", icon: theme.colors.warning };
      case "danger": return { bg: "bg-danger/10", text: "text-danger", border: "border-danger/20", icon: theme.colors.danger };
      default: return { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20", icon: theme.colors.primary };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenBackground />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          onPress={onBack}
          className="h-10 w-10 items-center justify-center rounded-2xl bg-card border border-border"
        >
          <ArrowLeft size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-textPrimary font-sans">Notifications</Text>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-2xl bg-card border border-border">
          <Trash2 size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} className="px-6">
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-textSecondary font-sans">Recent Updates</Text>
          <TouchableOpacity>
            <Text className="text-sm font-bold text-primary font-sans">Mark all as read</Text>
          </TouchableOpacity>
        </View>

        {MOCK_NOTIFICATIONS.map((notif) => {
          const colors = getStatusColors(notif.status);
          const Icon = notif.icon;
          
          return (
            <GlassCard key={notif.id} className="mb-4 overflow-hidden p-0">
              <View className="flex-row items-start p-4">
                <View className={`h-12 w-12 items-center justify-center rounded-2xl ${colors.bg} border ${colors.border}`}>
                  <Icon size={24} color={colors.icon} />
                </View>
                <View className="ml-4 flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-bold text-textPrimary font-sans">{notif.title}</Text>
                    <Text className="text-[10px] text-textSecondary font-sans">{notif.time}</Text>
                  </View>
                  <Text className="mt-1 text-sm leading-5 text-textSecondary font-sans">
                    {notif.message}
                  </Text>
                  <TouchableOpacity className="mt-3">
                    <Text className="text-xs font-bold text-primary font-sans">View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          );
        })}

        <View className="mt-6 items-center py-10">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-surface mb-4">
            <Bell size={40} color={theme.colors.textSecondary} opacity={0.3} />
          </View>
          <Text className="text-sm text-textSecondary font-sans">No more notifications</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 40,
  },
});
