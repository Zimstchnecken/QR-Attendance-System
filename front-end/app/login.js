import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ArrowRight, Lock, Mail, Shield, UserRound } from "lucide-react-native";
import { GlassCard, ScreenBackground } from "../components";
import { adminLoginDefaults } from "../data/auth";
import { theme } from "../constants/theme";

export default function AdminLoginScreen({ onLogin, onSwitchToStudent, onForgotPassword }) {
  const [email, setEmail] = useState(adminLoginDefaults.email);
  const [password, setPassword] = useState(adminLoginDefaults.password);
  const [focusedField, setFocusedField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 600);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenBackground />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} className="px-6 py-8" keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.heroBadge}>
              <Shield size={18} color="#FFFFFF" />
              <Text style={styles.heroBadgeText}>ZapRoll Staff</Text>
            </View>
            <Text style={styles.heroTitle}>Welcome to ZapRoll</Text>
            <Text style={styles.heroSubtitle}>
              Manage live roll calls, monitor class sessions, and send updates from one ZapRoll hub.
            </Text>
          </View>

          <GlassCard className="mb-5" style={styles.card}>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-base font-semibold text-textPrimary font-sans">Admin Login</Text>
              <View className="rounded-full bg-primary/10 px-3 py-1">
                <Text className="text-xs font-semibold text-primary font-sans">Secure</Text>
              </View>
            </View>

            <View className="mb-2 flex-row items-center gap-2">
              <Mail size={16} color={theme.colors.textSecondary} />
              <Text className="text-sm font-medium text-textSecondary font-sans">Email</Text>
            </View>
            <View
              className="mb-4 flex-row items-center gap-3 rounded-2xl border border-border bg-card px-4"
              style={[styles.inputWrapper, focusedField === "email" && styles.inputFocused]}
            >
              <Mail size={18} color={theme.colors.textSecondary} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="name@school.edu"
                placeholderTextColor="#9CA3AF"
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="none"
                className="flex-1 text-base text-textPrimary font-sans"
                style={styles.input}
              />
            </View>

            <View className="mb-2 flex-row items-center gap-2">
              <Lock size={16} color={theme.colors.textSecondary} />
              <Text className="text-sm font-medium text-textSecondary font-sans">Password</Text>
            </View>
            <View
              className="mb-4 flex-row items-center gap-3 rounded-2xl border border-border bg-card px-4"
              style={[styles.inputWrapper, focusedField === "password" && styles.inputFocused]}
            >
              <Lock size={18} color={theme.colors.textSecondary} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                className="flex-1 text-base text-textPrimary font-sans"
                style={styles.input}
              />
            </View>

            <TouchableOpacity
              onPress={handleContinue}
              activeOpacity={0.9}
              className="rounded-2xl bg-primary px-4 py-4"
              disabled={isLoading}
              style={styles.actionButton}
            >
              <View className="flex-row items-center justify-center gap-2">
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text className="text-center text-base font-semibold text-white font-sans">Continue to Dashboard</Text>
                    <ArrowRight size={18} color="#FFFFFF" />
                  </>
                )}
              </View>
            </TouchableOpacity>
          </GlassCard>

          <View className="mb-6 rounded-2xl border border-border bg-card p-4" style={styles.secondaryActions}>
            <TouchableOpacity onPress={onForgotPassword} activeOpacity={0.9} style={styles.secondaryButton}>
              <Text className="text-center text-sm font-semibold text-textPrimary font-sans">Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onSwitchToStudent} activeOpacity={0.9} style={styles.secondaryButton}>
              <View className="flex-row items-center justify-center gap-2">
                <UserRound size={16} color={theme.colors.primary} />
                <Text className="text-center text-sm font-semibold text-primary font-sans">Switch to Student Login</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text className="text-center text-sm text-textSecondary font-sans">
            Authorized ZapRoll staff accounts only.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  hero: {
    marginBottom: 16,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 20,
    backgroundColor: "rgba(15, 118, 110, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(15, 118, 110, 0.2)",
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "800",
  },
  heroSubtitle: {
    marginTop: 8,
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  card: {
    borderColor: "rgba(15, 118, 110, 0.22)",
  },
  input: {
    paddingVertical: theme.spacing.md,
  },
  inputWrapper: {
    borderRadius: theme.radius.input,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
  },
  actionButton: {
    minHeight: 50,
    justifyContent: "center",
  },
  secondaryActions: {
    gap: 10,
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: "center",
    paddingHorizontal: 12,
    backgroundColor: theme.colors.card,
  },
});
