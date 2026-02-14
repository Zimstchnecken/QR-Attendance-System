import { useState } from "react";
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GlassCard, ScreenBackground } from "../components";

export default function AdminLoginScreen({ onLogin, onSwitchToStudent }) {
  const [email, setEmail] = useState("teacher@school.edu");
  const [password, setPassword] = useState("password");

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <ScreenBackground />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-8">
        <View className="mb-8 mt-4">
          <Text className="text-4xl font-extrabold text-slate-900">QR Attendance</Text>
          <Text className="mt-2 text-base text-slate-600">Teacher access for session management</Text>
        </View>

        <GlassCard className="mb-6">
          <Text className="mb-1 text-sm font-semibold uppercase tracking-widest text-brand-600">Admin Login</Text>
          <Text className="mb-4 text-2xl font-bold text-slate-900">Teacher access</Text>

          <Text className="mb-2 text-sm font-medium text-slate-700">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="name@school.edu"
            className="mb-4 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900"
          />

          <Text className="mb-2 text-sm font-medium text-slate-700">Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Password"
            className="mb-5 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900"
          />

          <TouchableOpacity onPress={onLogin} className="rounded-2xl bg-brand-600 px-4 py-4">
            <Text className="text-center text-base font-semibold text-white">Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSwitchToStudent} className="mt-4">
            <Text className="text-center text-sm font-semibold text-brand-600">Student login</Text>
          </TouchableOpacity>
        </GlassCard>

        <Text className="text-center text-xs text-slate-500">Frontend-only prototype. No backend connection.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
