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
import { ArrowLeft, KeyRound, Mail, Send } from "lucide-react-native";
import { GlassCard, ScreenBackground } from "../components";
import { theme } from "../constants/theme";

export default function PasswordResetScreen({ onBack, onDone }) {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [wasSent, setWasSent] = useState(false);

  const handleReset = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setWasSent(true);
    }, 700);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenBackground />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} className="px-6 py-8">
          <View className="mb-6 mt-2 flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <KeyRound size={18} color={theme.colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-textPrimary font-sans">Password Reset</Text>
              <Text className="mt-1 text-sm text-textSecondary font-sans">Secure account recovery</Text>
            </View>
          </View>

          <GlassCard className="mb-6 overflow-hidden" style={styles.card}>
            <View style={styles.cardGlow} />

            <Text className="text-base font-semibold text-textPrimary font-sans">Email or Student ID</Text>
            <Text className="mt-1 text-sm text-textSecondary font-sans">
              Enter your account identifier to receive reset instructions.
            </Text>

            <View className="mt-3 flex-row items-center gap-3 rounded-2xl border border-border bg-card px-4" style={styles.inputWrapper}>
              <Mail size={18} color={theme.colors.textSecondary} />
              <TextInput
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="name@school.edu or ST-000"
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-base text-textPrimary font-sans"
                style={styles.input}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleReset}
              disabled={isLoading || identifier.trim().length < 3}
              className={`mt-4 rounded-2xl px-4 py-4 ${
                isLoading || identifier.trim().length < 3 ? "bg-surface" : "bg-primary"
              }`}
              style={styles.actionButton}
            >
              <View className="flex-row items-center justify-center gap-2">
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Send size={18} color="#FFFFFF" />
                    <Text className="text-center text-base font-semibold text-white font-sans">Send reset link</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {wasSent && (
              <View className="mt-4 rounded-2xl border border-success/20 bg-success/10 p-4">
                <Text className="text-sm font-semibold text-success font-sans">
                  Reset instructions sent. Check your messages and follow the secure link.
                </Text>
              </View>
            )}
          </GlassCard>

          <View className="flex-row gap-3">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onBack}
              className="flex-1 rounded-2xl border border-border bg-card px-4 py-4"
              style={styles.actionButton}
            >
              <View className="flex-row items-center justify-center gap-2">
                <ArrowLeft size={18} color={theme.colors.textPrimary} />
                <Text className="text-center text-base font-semibold text-textPrimary font-sans">Back</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onDone}
              className="flex-1 rounded-2xl bg-textPrimary px-4 py-4"
              style={styles.actionButton}
            >
              <Text className="text-center text-base font-semibold text-white font-sans">Done</Text>
            </TouchableOpacity>
          </View>
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
  card: {
    borderColor: "rgba(15, 118, 110, 0.22)",
  },
  cardGlow: {
    position: "absolute",
    right: -34,
    top: -34,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: "rgba(15, 118, 110, 0.1)",
  },
  inputWrapper: {
    borderRadius: theme.radius.input,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  input: {
    paddingVertical: theme.spacing.md,
  },
  actionButton: {
    minHeight: 48,
    justifyContent: "center",
  },
});
