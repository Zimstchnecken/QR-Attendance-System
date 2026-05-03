import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  HelpCircle,
  Mail,
  MessageSquare,
  ShieldCheck,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassCard, ScreenBackground } from "../components";
import { theme } from "../constants/theme";

export default function SupportScreen({ onBack }) {
  const [activeSubPage, setActiveSubPage] = useState(null); // 'guide', 'privacy'

  const SupportItem = ({ icon: Icon, title, description, onPress }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="mb-4 flex-row items-start p-4 rounded-3xl border border-border bg-card"
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
        <Icon size={24} color={theme.colors.primary} />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-base font-bold text-textPrimary font-sans">{title}</Text>
        <Text className="mt-1 text-sm leading-5 text-textSecondary font-sans">
          {description}
        </Text>
      </View>
      <ChevronRight size={16} color={theme.colors.textSecondary} style={{ marginTop: 4 }} />
    </TouchableOpacity>
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
          {activeSubPage === 'guide' ? 'User Guide' : 
           activeSubPage === 'privacy' ? 'Privacy Policy' : 'Help & Support'}
        </Text>
        <View className="w-10" />
      </View>

      {!activeSubPage && (
        <ScrollView contentContainerStyle={styles.scrollContent} className="px-6">
          <View className="mb-8 items-center py-6">
            <View className="h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 mb-4">
              <HelpCircle size={48} color={theme.colors.primary} />
            </View>
            <Text className="text-xl font-bold text-textPrimary font-sans text-center">How can we help you?</Text>
            <Text className="mt-2 text-sm text-textSecondary font-sans text-center px-6">
              Search our knowledge base or contact our support team for assistance with ZapRoll.
            </Text>
          </View>

          <Text className="mb-4 text-xs font-bold uppercase tracking-widest text-textSecondary font-sans ml-1">
            Resources
          </Text>
          
          <SupportItem
            icon={BookOpen}
            title="User Guide"
            description="Learn how to use ZapRoll features, from scanning QR codes to managing sections."
            onPress={() => setActiveSubPage('guide')}
          />

          <SupportItem
            icon={ShieldCheck}
            title="Privacy Policy"
            description="Understand how we protect your data and what information we collect."
            onPress={() => setActiveSubPage('privacy')}
          />

          <Text className="mb-4 mt-4 text-xs font-bold uppercase tracking-widest text-textSecondary font-sans ml-1">
            Contact Us
          </Text>

          <SupportItem
            icon={Mail}
            title="Email Support"
            description="Send us an email at support@zaproll.edu. We typically respond within 24 hours."
            onPress={() => Linking.openURL('mailto:support@zaproll.edu')}
          />

          <SupportItem
            icon={MessageSquare}
            title="Live Chat"
            description="Chat with our support agents for immediate assistance during school hours."
            onPress={() => {}}
          />

          <View className="mt-10 items-center">
            <Text className="text-xs text-textSecondary font-sans">Version 1.0.4 (Build 42)</Text>
            <Text className="mt-1 text-xs text-textSecondary font-sans">© 2026 ZapRoll Education Solutions</Text>
          </View>
        </ScrollView>
      )}

      {activeSubPage === 'guide' && (
        <ScrollView contentContainerStyle={styles.scrollContent} className="px-6">
          <GlassCard className="mb-6 p-5">
            <Text className="text-lg font-bold text-primary font-sans mb-3">Quick Start Guide</Text>
            <Text className="text-sm text-textSecondary font-sans leading-5 mb-4">
              Welcome to ZapRoll. Our system uses rotating QR technology to ensure secure and accurate attendance tracking.
            </Text>
            
            <Text className="text-base font-bold text-textPrimary font-sans mb-1">For Students</Text>
            <Text className="text-sm text-textSecondary font-sans leading-5 mb-4">
              1. Tap the "Scan" button on your dashboard.{"\n"}
              2. Point your camera at the teacher's screen.{"\n"}
              3. Once verified, your attendance is recorded instantly.
            </Text>

            <Text className="text-base font-bold text-textPrimary font-sans mb-1">For Teachers</Text>
            <Text className="text-sm text-textSecondary font-sans leading-5 mb-4">
              1. Select your section from the dashboard.{"\n"}
              2. Tap "Generate Session" to show the rotating QR code.{"\n"}
              3. Keep the screen visible until all students have checked in.
            </Text>
          </GlassCard>

          <GlassCard className="mb-6 p-5">
            <Text className="text-lg font-bold text-textPrimary font-sans mb-3">Troubleshooting</Text>
            <View className="mb-3">
              <Text className="text-sm font-bold text-textPrimary font-sans">QR won't scan?</Text>
              <Text className="text-xs text-textSecondary font-sans leading-4">
                Ensure your screen brightness is up and the camera lens is clean. Check if your internet connection is active.
              </Text>
            </View>
            <View>
              <Text className="text-sm font-bold text-textPrimary font-sans">"Invalid Session" error?</Text>
              <Text className="text-xs text-textSecondary font-sans leading-4">
                This happens if the QR code has expired or was already used. Ask the teacher to refresh the session.
              </Text>
            </View>
          </GlassCard>
          
          <TouchableOpacity 
            onPress={() => setActiveSubPage(null)}
            className="rounded-2xl bg-primary py-4 items-center"
          >
            <Text className="text-base font-bold text-white font-sans">Close Guide</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {activeSubPage === 'privacy' && (
        <ScrollView contentContainerStyle={styles.scrollContent} className="px-6">
          <GlassCard className="mb-6 p-5">
            <Text className="text-lg font-bold text-primary font-sans mb-3">Your Privacy Matters</Text>
            <Text className="text-sm text-textSecondary font-sans leading-6 mb-4">
              ZapRoll is built with "Privacy by Design" principles to protect educational data.
            </Text>

            <Text className="text-base font-bold text-textPrimary font-sans mb-1">What we collect</Text>
            <Text className="text-sm text-textSecondary font-sans leading-5 mb-4">
              We collect your name, student ID, and school-issued email to manage your profile. Attendance logs include the timestamp and the specific session ID.
            </Text>

            <Text className="text-base font-bold text-textPrimary font-sans mb-1">Data Usage</Text>
            <Text className="text-sm text-textSecondary font-sans leading-5 mb-4">
              Your data is used strictly for academic attendance reporting. We never sell your data to third-party advertisers.
            </Text>

            <Text className="text-base font-bold text-textPrimary font-sans mb-1">Device Permissions</Text>
            <Text className="text-sm text-textSecondary font-sans leading-5">
              • Camera: Used only for scanning QR codes.{"\n"}
              • Storage: Used to cache your session securely.{"\n"}
              • Notifications: Optional, used for attendance alerts.
            </Text>
          </GlassCard>

          <GlassCard className="mb-10 p-5">
            <Text className="text-sm font-bold text-textPrimary font-sans mb-2">Compliance</Text>
            <Text className="text-xs text-textSecondary font-sans leading-4">
              ZapRoll complies with FERPA and local data privacy regulations regarding the handling of student educational records.
            </Text>
          </GlassCard>
          
          <TouchableOpacity 
            onPress={() => setActiveSubPage(null)}
            className="rounded-2xl bg-primary py-4 items-center shadow-lg"
          >
            <Text className="text-base font-bold text-white font-sans">Understood</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 40,
  },
});
