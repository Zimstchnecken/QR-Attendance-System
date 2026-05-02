import React from "react";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Bell, CalendarCheck, ClipboardCheck, LogOut, Settings, Users } from "lucide-react-native";
import { theme } from "../../../constants/theme";

export const DashboardHeader = ({ onLogout, onNavigateToSettings, onNavigateToNotifications, teachingSubject }) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <View className="mb-6 overflow-hidden rounded-[32px] border border-white/20 bg-primary" style={styles.bannerCard}>
      <View style={styles.bannerGlowTop} />
      <View style={styles.bannerGlowBottom} />
      <View style={styles.bannerGlowCenter} />

      <View className="px-6 pb-6 pt-6" style={isCompact ? styles.bannerPaddingCompact : null}>
        {/* Navigation & Utilities */}
        <View className="mb-6 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5">
            <View className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
            <Text className="text-[10px] font-bold uppercase tracking-[2px] text-white font-sans">
              Admin Console
            </Text>
          </View>
          
          <View className="flex-row items-center gap-2.5">
            <TouchableOpacity
              onPress={onNavigateToNotifications}
              activeOpacity={0.7}
              className="h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10"
              style={styles.glassButton}
            >
              <Bell size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={onNavigateToSettings}
              activeOpacity={0.7}
              className="h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10"
              style={styles.glassButton}
            >
              <Settings size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onLogout}
              activeOpacity={0.7}
              className="h-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-4"
              style={styles.glassButton}
            >
              <LogOut size={16} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Hero Section */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-1">
             <Text className="text-sm font-medium text-white/80 font-sans">{getGreeting()},</Text>
             <View className="h-px w-6 bg-white/30" />
          </View>
          <Text className="text-4xl font-bold text-white font-sans tracking-tight" style={isCompact ? styles.compactTitleText : null}>
            {teachingSubject ? `${teachingSubject} ` : "Teacher"} Dashboard
          </Text>
          <Text className="mt-2 text-base leading-6 text-white/70 font-sans" style={isCompact ? { fontSize: 14 } : null}>
            Effortlessly manage {teachingSubject || "your classes"}, track attendance, and stay connected.
          </Text>
        </View>

        {/* Quick Insights Bar */}
        <View className="flex-row flex-wrap gap-2.5">
          <InsightChip icon={CalendarCheck} label="Sessions" />
          <InsightChip icon={Users} label="Roster" />
          <InsightChip icon={ClipboardCheck} label="Reports" />
        </View>
      </View>
    </View>
  );
};

const InsightChip = ({ icon: Icon, label }) => (
  <View className="flex-row items-center gap-2 rounded-2xl bg-white/10 px-3.5 py-2.5 border border-white/10 shadow-sm shadow-black/5">
    <Icon size={14} color="#FFFFFF" strokeWidth={2.5} />
    <Text className="text-[11px] font-bold text-white font-sans tracking-tight">{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  bannerCard: {
    backgroundColor: theme.colors.primary,
    ...theme.shadow.lg,
  },
  glassButton: {
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  bannerPaddingCompact: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  compactTitleText: {
    fontSize: 30,
    lineHeight: 36,
  },
  bannerGlowTop: {
    position: "absolute", right: -40, top: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  bannerGlowBottom: {
    position: "absolute", left: -80, bottom: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  bannerGlowCenter: {
    position: "absolute", right: "20%", bottom: "10%", width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});
