import { useState } from "react";
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GlassCard, ScreenBackground } from "../components";
import { studentLoginDefaults } from "../data/auth";

export default function StudentLoginScreen({ onLogin, onSwitchToAdmin }) {
  const [studentId, setStudentId] = useState(studentLoginDefaults.studentId);
  const [pin, setPin] = useState(studentLoginDefaults.pin);

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <ScreenBackground />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-8">
        <View className="mb-8 mt-4">
          <Text className="text-4xl font-extrabold text-slate-900">QR Attendance</Text>
          <Text className="mt-2 text-base text-slate-600">Student access for fast check-ins</Text>
        </View>

        <GlassCard className="mb-6">
          <Text className="mb-1 text-sm font-semibold uppercase tracking-widest text-brand-600">Student Login</Text>
          <Text className="mb-4 text-2xl font-bold text-slate-900">Check-in access</Text>

          <Text className="mb-2 text-sm font-medium text-slate-700">Student ID</Text>
          <TextInput
            value={studentId}
            onChangeText={setStudentId}
            placeholder="ST-000"
            className="mb-4 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900"
          />

          <Text className="mb-2 text-sm font-medium text-slate-700">PIN</Text>
          <TextInput
            value={pin}
            onChangeText={setPin}
            secureTextEntry
            placeholder="4-digit PIN"
            className="mb-5 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900"
          />

          <TouchableOpacity onPress={onLogin} className="rounded-2xl bg-brand-600 px-4 py-4">
            <Text className="text-center text-base font-semibold text-white">Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSwitchToAdmin} className="mt-4">
            <Text className="text-center text-sm font-semibold text-brand-600">Admin login</Text>
          </TouchableOpacity>
        </GlassCard>

        <Text className="text-center text-xs text-slate-500">Frontend-only prototype. No backend connection.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
