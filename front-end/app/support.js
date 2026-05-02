import React from "react";
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
  ExternalLink,
  HelpCircle,
  Mail,
  MessageSquare,
  ShieldInfo,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassCard, ScreenBackground } from "../components";
import { theme } from "../constants/theme";

export default function SupportScreen({ onBack }) {
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
      <ExternalLink size={16} color={theme.colors.textSecondary} style={{ marginTop: 4 }} />
    </TouchableOpacity>
  );

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
        <Text className="text-lg font-bold text-textPrimary font-sans">Help & Support</Text>
        <View className="w-10" />
      </View>

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
          onPress={() => {}}
        />

        <SupportItem
          icon={ShieldInfo}
          title="Privacy Policy"
          description="Understand how we protect your data and what information we collect."
          onPress={() => {}}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 40,
  },
});
