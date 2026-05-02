import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Platform,
  TextInput,
} from "react-native";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  ChevronRight,
  Database,
  Globe,
  HelpCircle,
  Info,
  LogOut,
  Moon,
  ShieldCheck,
  User,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassCard, ScreenBackground } from "../components";
import { theme } from "../constants/theme";

export default function SettingsScreen({ onBack, onLogout, onSupport, onUpdateSubject, session }) {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [activeSubPage, setActiveSubPage] = useState(null); // 'privacy', 'about', 'language'

  const userRole = session?.user?.role || "Admin";
  const userName = session?.user?.name || (userRole === "Admin" ? "Administrator" : "Student User");
  const userIdentifier = session?.user?.email || session?.user?.studentId || "zaproll.user@school.edu";

  // Persistent settings (In a real app, these would load from AsyncStorage on mount)
  const [teachingSubject, setTeachingSubject] = useState(session?.user?.subject || "General Education");

  // Keep local state in sync with session prop changes
  React.useEffect(() => {
    if (session?.user?.subject) {
      setTeachingSubject(session.user.subject);
    }
  }, [session?.user?.subject]);

  const SettingItem = ({ icon: Icon, label, value, onPress, isLast, color = theme.colors.textPrimary }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`flex-row items-center justify-between py-4 ${!isLast ? "border-b border-border/50" : ""}`}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface">
          <Icon size={20} color={color} />
        </View>
        <Text className="text-base font-medium text-textPrimary font-sans">{label}</Text>
      </View>
      {value !== undefined ? (
        <View className="flex-row items-center gap-2">
          {typeof value === "boolean" ? (
            <Switch
              value={value}
              onValueChange={onPress}
              trackColor={{ false: "#D1D5DB", true: theme.colors.primary }}
              thumbColor={Platform.OS === "ios" ? "#FFFFFF" : value ? theme.colors.primary : "#F4F3F4"}
            />
          ) : (
            <>
              <Text className="text-sm text-textSecondary font-sans">{value}</Text>
              <ChevronRight size={18} color={theme.colors.textSecondary} />
            </>
          )}
        </View>
      ) : (
        <ChevronRight size={18} color={theme.colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  const renderMainSettings = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} className="px-6">
      {/* Profile Section */}
      <GlassCard className="mb-6 p-4">
        <View className="flex-row items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <User size={32} color={theme.colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-textPrimary font-sans">{userName}</Text>
            <Text className="text-sm text-textSecondary font-sans">{userIdentifier}</Text>
            <View className="mt-1 self-start rounded-full bg-primary/10 px-2 py-0.5">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-primary font-sans">{userRole}</Text>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* Account Settings */}
      <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-textSecondary font-sans ml-1">
        Preferences
      </Text>
      <GlassCard className="mb-6 px-4">
        <SettingItem
          icon={BookOpen}
          label="Teaching Subject"
          value={teachingSubject}
          onPress={() => setActiveSubPage("subject")}
        />
        <SettingItem
          icon={Bell}
          label="Push Notifications"
          value={pushNotifications}
          onPress={() => setPushNotifications(!pushNotifications)}
        />
        <SettingItem
          icon={Globe}
          label="Language"
          value="English (US)"
          onPress={() => setActiveSubPage("language")}
          isLast
        />
      </GlassCard>

      {/* System Settings */}
      <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-textSecondary font-sans ml-1">
        System
      </Text>
      <GlassCard className="mb-6 px-4">
        <SettingItem
          icon={Database}
          label="Server Environment"
          value="Production"
        />
        <SettingItem
          icon={ShieldCheck}
          label="Privacy & Security"
          onPress={() => setActiveSubPage("privacy")}
        />
        <SettingItem
          icon={HelpCircle}
          label="Help & Support"
          onPress={onSupport}
        />
        <SettingItem
          icon={Info}
          label="About ZapRoll"
          value="v1.0.4"
          onPress={() => setActiveSubPage("about")}
          isLast
        />
      </GlassCard>

      {/* Actions */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onLogout}
        className="mb-10 flex-row items-center justify-center gap-2 rounded-2xl bg-danger/10 py-4 border border-danger/20"
      >
        <LogOut size={20} color={theme.colors.danger} />
        <Text className="text-base font-bold text-danger font-sans">Sign Out</Text>
      </TouchableOpacity>

      <Text className="text-center text-xs text-textSecondary font-sans mb-6">
        ZapRoll Attendance System © 2026
      </Text>
    </ScrollView>
  );

  const renderPrivacySubPage = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} className="px-6">
      <GlassCard className="mb-6 p-6">
        <Text className="text-xl font-bold text-textPrimary font-sans mb-4">Privacy & Security</Text>
        
        <Text className="text-base font-semibold text-textPrimary font-sans mb-2">Data Protection</Text>
        <Text className="text-sm text-textSecondary font-sans leading-5 mb-4">
          ZapRoll uses end-to-end encryption for QR code generation to prevent attendance spoofing. Your biometric data (if used for device login) stays securely on your device and is never uploaded to our servers.
        </Text>

        <Text className="text-base font-semibold text-textPrimary font-sans mb-2">Location Access</Text>
        <Text className="text-sm text-textSecondary font-sans leading-5 mb-4">
          We only request location access during active scanning to ensure you are physically present in the classroom. This data is not stored permanently.
        </Text>

        <Text className="text-base font-semibold text-textPrimary font-sans mb-2">Security Sessions</Text>
        <Text className="text-sm text-textSecondary font-sans leading-5">
          Your current session is secured with JWT tokens. If you lose your device, please contact your administrator to invalidate all active sessions immediately.
        </Text>
      </GlassCard>
      
      <TouchableOpacity 
        onPress={() => setActiveSubPage(null)}
        className="rounded-2xl bg-primary py-4 items-center"
      >
        <Text className="text-base font-bold text-white font-sans">Got it</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderAboutSubPage = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} className="px-6">
      <View className="items-center py-8">
        <View className="h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 mb-4">
          <Info size={48} color={theme.colors.primary} />
        </View>
        <Text className="text-2xl font-bold text-textPrimary font-sans">ZapRoll v1.0.4</Text>
        <Text className="text-sm text-textSecondary font-sans mt-1">Smart Attendance Redefined</Text>
      </View>

      <GlassCard className="mb-6 p-6">
        <Text className="text-sm text-textSecondary font-sans leading-6 text-center">
          ZapRoll is a high-performance attendance tracking system designed for modern schools. Our mission is to eliminate manual roll calls and provide real-time, tamper-proof attendance data through rotating QR technology.
        </Text>
      </GlassCard>

      <View className="mb-10 rounded-2xl border border-border bg-surface p-4">
        <View className="flex-row justify-between mb-3">
          <Text className="text-sm text-textSecondary font-sans">Version</Text>
          <Text className="text-sm font-bold text-textPrimary font-sans">1.0.4 (stable)</Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="text-sm text-textSecondary font-sans">Build Number</Text>
          <Text className="text-sm font-bold text-textPrimary font-sans">20260502-01</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm text-textSecondary font-sans">Developed by</Text>
          <Text className="text-sm font-bold text-textPrimary font-sans">Antigravity Labs</Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => setActiveSubPage(null)}
        className="rounded-2xl bg-primary py-4 items-center"
      >
        <Text className="text-base font-bold text-white font-sans">Back to Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderLanguageSubPage = () => (
    <View className="px-6">
      <GlassCard className="mb-6 p-4">
        {["English (US)", "English (UK)", "Filipino", "Spanish"].map((lang, index) => (
          <TouchableOpacity 
            key={lang}
            className={`py-4 flex-row justify-between items-center ${index < 3 ? "border-b border-border/50" : ""}`}
            onPress={() => setActiveSubPage(null)}
          >
            <Text className={`text-base font-sans ${lang === "English (US)" ? "font-bold text-primary" : "text-textPrimary"}`}>
              {lang}
            </Text>
            {lang === "English (US)" && <View className="h-2 w-2 rounded-full bg-primary" />}
          </TouchableOpacity>
        ))}
      </GlassCard>
    </View>
  );

  const renderSubjectSubPage = () => (
    <View className="px-6">
      <GlassCard className="mb-6 p-6">
        <Text className="text-xl font-bold text-textPrimary font-sans mb-2">Teaching Subject</Text>
        <Text className="text-sm text-textSecondary font-sans mb-6">
          Set your primary teaching subject. This will be used as the default name for your live QR sessions.
        </Text>
        
        <View className="mb-6">
          <Text className="mb-2 text-[10px] font-bold uppercase text-textSecondary font-sans ml-1">Subject Name</Text>
          <TextInput
            value={teachingSubject}
            onChangeText={setTeachingSubject}
            placeholder="e.g., Advanced Mathematics"
            placeholderTextColor="#9CA3AF"
            className="rounded-2xl border border-border bg-background px-4 py-4 text-base text-textPrimary font-sans"
            autoFocus
          />
        </View>

        <TouchableOpacity 
          onPress={() => {
            if (onUpdateSubject) onUpdateSubject(teachingSubject);
            setActiveSubPage(null);
          }}
          className="rounded-2xl bg-primary py-4 items-center"
        >
          <Text className="text-base font-bold text-white font-sans">Save Subject</Text>
        </TouchableOpacity>
      </GlassCard>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenBackground />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          onPress={activeSubPage ? () => setActiveSubPage(null) : onBack}
          className="h-10 w-10 items-center justify-center rounded-2xl bg-card border border-border"
        >
          <ArrowLeft size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-textPrimary font-sans">
          {activeSubPage === 'privacy' ? 'Privacy & Security' : 
           activeSubPage === 'about' ? 'About ZapRoll' :
           activeSubPage === 'subject' ? 'Teaching Subject' :
           activeSubPage === 'language' ? 'Select Language' : 'Settings'}
        </Text>
        <View className="w-10" />
      </View>

      {!activeSubPage && renderMainSettings()}
      {activeSubPage === 'privacy' && renderPrivacySubPage()}
      {activeSubPage === 'about' && renderAboutSubPage()}
      {activeSubPage === 'language' && renderLanguageSubPage()}
      {activeSubPage === 'subject' && renderSubjectSubPage()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 40,
  },
});
