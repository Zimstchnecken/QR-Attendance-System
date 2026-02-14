import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { GlassCard, ScreenBackground } from "../components";

export default function StudentScreen({ onLogout }) {
  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <ScreenBackground />
      <ScrollView className="px-6 py-6">
        <View className="mb-5 flex-row flex-wrap items-center justify-between gap-3">
          <View className="flex-1 pr-2">
            <Text className="text-2xl font-extrabold text-slate-900">Student Check-In</Text>
            <Text className="text-slate-600">Scan the active class QR code</Text>
          </View>
          <TouchableOpacity onPress={onLogout} className="self-start rounded-xl bg-slate-800 px-3 py-2">
            <Text className="text-xs font-semibold text-white">Logout</Text>
          </TouchableOpacity>
        </View>

        <GlassCard className="mb-5 items-center">
          <Text className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-600">QR Scanner</Text>
          <View className="h-64 w-full items-center justify-center rounded-3xl border-2 border-dashed border-brand-400 bg-white">
            <Text className="text-center text-lg font-semibold text-brand-600">Camera Preview</Text>
            <Text className="mt-2 text-center text-sm text-slate-500">Placeholder for QR scan component</Text>
          </View>
          <TouchableOpacity className="mt-4 w-full rounded-2xl bg-brand-600 px-4 py-4">
            <Text className="text-center font-semibold text-white">Simulate Successful Scan</Text>
          </TouchableOpacity>
        </GlassCard>

        <GlassCard className="mb-4">
          <Text className="mb-2 text-lg font-bold text-slate-900">Latest Status</Text>
          <Text className="text-slate-700">Class: Grade 12 - STEM A</Text>
          <Text className="text-slate-700">Time: 08:03 AM</Text>
          <Text className="mt-2 font-semibold text-emerald-700">Attendance recorded. Parent email queued.</Text>
        </GlassCard>

        <GlassCard>
          <Text className="mb-2 text-lg font-bold text-slate-900">Scan Tips</Text>
          <Text className="text-slate-600">Hold your phone steady and align the QR inside the frame.</Text>
          <Text className="mt-1 text-slate-600">If offline, your check-in will be saved locally.</Text>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}
