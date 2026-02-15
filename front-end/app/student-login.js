import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { GraduationCap, LogIn, Shield, Lock } from "lucide-react-native";
import { GlassCard, ScreenBackground } from "../components";
import { studentLoginDefaults } from "../data/auth";
import { theme } from "../constants/theme";

export default function StudentLoginScreen({ onLogin, onSwitchToAdmin }) {
  const [studentId, setStudentId] = useState(studentLoginDefaults.studentId);
  const [pin, setPin] = useState(studentLoginDefaults.pin);
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          className="px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-8 mt-2">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                <GraduationCap size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text className="text-2xl font-bold text-textPrimary font-sans">QR Attendance</Text>
                <Text className="mt-2 text-sm text-textSecondary font-sans">Student access for fast check-ins</Text>
              </View>
            </View>
          </View>

          <GlassCard className="mb-6">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">
              Student Login
            </Text>
            <Text className="mb-4 text-lg font-semibold text-textPrimary font-sans">Check-in access</Text>

            <View className="mb-2 flex-row items-center gap-2">
              <Text className="text-sm font-medium text-textSecondary font-sans">Student ID</Text>
            </View>
            <View
              className="mb-4 flex-row items-center gap-3 rounded-2xl border border-border bg-card px-4"
              style={[styles.inputWrapper, focusedField === "studentId" && styles.inputFocused]}
            >
              <GraduationCap size={18} color={theme.colors.textSecondary} />
              <TextInput
                value={studentId}
                onChangeText={setStudentId}
                placeholder="ST-000"
                placeholderTextColor="#9CA3AF"
                onFocus={() => setFocusedField("studentId")}
                onBlur={() => setFocusedField(null)}
                className="flex-1 text-base text-textPrimary font-sans"
                style={styles.input}
              />
            </View>

            <View className="mb-2 flex-row items-center gap-2">
              <Text className="text-sm font-medium text-textSecondary font-sans">Password</Text>
            </View>
            <View
              className="mb-4 flex-row items-center gap-3 rounded-2xl border border-border bg-card px-4"
              style={[styles.inputWrapper, focusedField === "pin" && styles.inputFocused]}
            >
              <Lock size={18} color={theme.colors.textSecondary} />
              <TextInput
                value={pin}
                onChangeText={setPin}
                secureTextEntry
                placeholder="Enter password"
                placeholderTextColor="#9CA3AF"
                onFocus={() => setFocusedField("pin")}
                onBlur={() => setFocusedField(null)}
                className="flex-1 text-base text-textPrimary font-sans"
                style={styles.input}
              />
            </View>

            <TouchableOpacity onPress={handleContinue} activeOpacity={0.9} className="rounded-2xl bg-primary px-4 py-4" disabled={isLoading}>
              <View className="flex-row items-center justify-center gap-2">
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <LogIn size={18} color="#FFFFFF" />
                    <Text className="text-center text-base font-semibold text-white font-sans">Continue</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSwitchToAdmin} activeOpacity={0.9} className="mt-4">
              <View className="flex-row items-center justify-center gap-2">
                <Shield size={18} color={theme.colors.primary} />
                <Text className="text-center text-sm font-semibold text-primary font-sans">Admin login</Text>
              </View>
            </TouchableOpacity>
          </GlassCard>

          <Text className="text-center text-sm text-textSecondary font-sans">Secure student access for check-ins.</Text>
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
    paddingBottom: theme.spacing.xl,
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
});
