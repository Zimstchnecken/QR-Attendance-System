import { useState } from "react";
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GraduationCap, Hash, KeyRound, LogIn, ShieldCheck } from "lucide-react-native";
import { GlassCard, ScreenBackground } from "../components";
import { studentLoginDefaults } from "../data/auth";

export default function StudentLoginScreen({ onLogin, onSwitchToAdmin }) {
  const [studentId, setStudentId] = useState(studentLoginDefaults.studentId);
  const [pin, setPin] = useState(studentLoginDefaults.pin);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenBackground />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-8">
        <View className="mb-8 mt-2">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <GraduationCap size={20} color="#4F6BED" />
            </View>
            <View>
              <Text className="text-2xl font-bold text-textPrimary font-sans">QR Attendance</Text>
              <Text className="mt-2 text-sm text-textSecondary font-sans">Student access for fast check-ins</Text>
            </View>
          </View>
        </View>

        <GlassCard className="mb-6">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-widest text-textSecondary font-sans">Student Login</Text>
          <Text className="mb-4 text-lg font-semibold text-textPrimary font-sans">Check-in access</Text>

          <View className="mb-2 flex-row items-center gap-2">
            <Hash size={16} color="#6B7280" />
            <Text className="text-sm font-medium text-textSecondary font-sans">Student ID</Text>
          </View>
          <TextInput
            value={studentId}
            onChangeText={setStudentId}
            placeholder="ST-000"
            placeholderTextColor="#9CA3AF"
            className="mb-4 rounded-2xl border border-border bg-card px-4 py-3 text-base text-textPrimary font-sans"
          />

          <View className="mb-2 flex-row items-center gap-2">
            <KeyRound size={16} color="#6B7280" />
            <Text className="text-sm font-medium text-textSecondary font-sans">PIN</Text>
          </View>
          <TextInput
            value={pin}
            onChangeText={setPin}
            secureTextEntry
            placeholder="4-digit PIN"
            placeholderTextColor="#9CA3AF"
            className="mb-5 rounded-2xl border border-border bg-card px-4 py-3 text-base text-textPrimary font-sans"
          />

          <TouchableOpacity onPress={onLogin} activeOpacity={0.85} className="rounded-2xl bg-primary px-4 py-4">
            <View className="flex-row items-center justify-center gap-2">
              <LogIn size={18} color="#FFFFFF" />
              <Text className="text-center text-base font-semibold text-white font-sans">Continue</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSwitchToAdmin} activeOpacity={0.7} className="mt-4">
            <View className="flex-row items-center justify-center gap-2">
              <ShieldCheck size={16} color="#4F6BED" />
              <Text className="text-center text-sm font-semibold text-primary font-sans">Admin login</Text>
            </View>
          </TouchableOpacity>
        </GlassCard>

        <Text className="text-center text-xs text-textSecondary font-sans">Frontend-only prototype. No backend connection.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
