import { useState } from "react";
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GraduationCap, Lock, LogIn, Mail, ShieldCheck } from "lucide-react-native";
import { GlassCard, ScreenBackground } from "../components";
import { adminLoginDefaults } from "../data/auth";

export default function AdminLoginScreen({ onLogin, onSwitchToStudent }) {
  const [email, setEmail] = useState(adminLoginDefaults.email);
  const [password, setPassword] = useState(adminLoginDefaults.password);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenBackground />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-8">
        <View className="mb-8 mt-2">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <ShieldCheck size={20} color="#4F6BED" />
            </View>
            <View>
              <Text className="text-2xl font-bold text-textPrimary font-sans">QR Attendance</Text>
              <Text className="mt-2 text-sm text-textSecondary font-sans">Teacher access for session management</Text>
            </View>
          </View>
        </View>

        <GlassCard className="mb-6">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">Admin Login</Text>
          <Text className="mb-4 text-lg font-semibold text-textPrimary font-sans">Teacher access</Text>

          <View className="mb-2 flex-row items-center gap-2">
            <Mail size={16} color="#6B7280" />
            <Text className="text-sm font-medium text-textSecondary font-sans">Email</Text>
          </View>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="name@school.edu"
            placeholderTextColor="#9CA3AF"
            className="mb-4 rounded-2xl border border-border bg-card px-4 py-3 text-base text-textPrimary font-sans"
          />

          <View className="mb-2 flex-row items-center gap-2">
            <Lock size={16} color="#6B7280" />
            <Text className="text-sm font-medium text-textSecondary font-sans">Password</Text>
          </View>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            className="mb-5 rounded-2xl border border-border bg-card px-4 py-3 text-base text-textPrimary font-sans"
          />

          <TouchableOpacity onPress={onLogin} activeOpacity={0.85} className="rounded-2xl bg-primary px-4 py-4">
            <View className="flex-row items-center justify-center gap-2">
              <LogIn size={18} color="#FFFFFF" />
              <Text className="text-center text-base font-semibold text-white font-sans">Continue</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSwitchToStudent} activeOpacity={0.7} className="mt-4">
            <View className="flex-row items-center justify-center gap-2">
              <GraduationCap size={16} color="#4F6BED" />
              <Text className="text-center text-sm font-semibold text-primary font-sans">Student login</Text>
            </View>
          </TouchableOpacity>
        </GlassCard>

        <Text className="text-center text-xs text-textSecondary font-sans">Frontend-only prototype. No backend connection.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
