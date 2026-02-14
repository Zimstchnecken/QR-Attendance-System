import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { GlassCard, ScreenBackground } from "../components";

const sessionRows = [
  { id: "S1", className: "Grade 10 - Newton", present: 37, total: 41, status: "Active" },
  { id: "S2", className: "Grade 11 - Einstein", present: 32, total: 39, status: "Closed" },
  { id: "S3", className: "Grade 12 - STEM A", present: 28, total: 30, status: "Active" },
];

const studentRows = [
  { id: "ST-021", name: "Alyssa Cruz", parent: "alyssa.parent@mail.com" },
  { id: "ST-034", name: "Joshua Lim", parent: "lim.family@mail.com" },
  { id: "ST-078", name: "Katrina Santos", parent: "k.santos@mail.com" },
];

const logRows = [
  { id: "L1", name: "Alyssa Cruz", className: "Grade 12 - STEM A", time: "08:03 AM" },
  { id: "L2", name: "Joshua Lim", className: "Grade 12 - STEM A", time: "08:04 AM" },
  { id: "L3", name: "Katrina Santos", className: "Grade 12 - STEM A", time: "08:06 AM" },
];

export default function AdminScreen({ onLogout }) {
  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <ScreenBackground />
      <ScrollView className="px-6 py-6" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mb-5 flex-row flex-wrap items-start justify-between gap-3">
          <View className="flex-1 pr-2">
            <Text className="text-2xl font-extrabold text-slate-900">Teacher Dashboard</Text>
            <Text className="text-slate-600">Manage sessions, students, and attendance export</Text>
          </View>
          <TouchableOpacity onPress={onLogout} className="self-start rounded-xl bg-slate-800 px-3 py-2">
            <Text className="text-xs font-semibold text-white">Logout</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-5 flex-row gap-3">
          <GlassCard className="flex-1 border border-slate-200 bg-white">
            <View className="self-start rounded-full bg-slate-100 px-3 py-1">
              <Text className="text-xs font-semibold uppercase tracking-widest text-slate-700">Active Sessions</Text>
            </View>
            <Text className="mt-2 text-3xl font-extrabold text-slate-900">02</Text>
            <Text className="text-xs text-slate-600">Live QR codes right now</Text>
          </GlassCard>
          <GlassCard className="flex-1 border border-slate-200 bg-white">
            <View className="self-start rounded-full bg-slate-100 px-3 py-1">
              <Text className="text-xs font-semibold uppercase tracking-widest text-slate-700">Emails Sent</Text>
            </View>
            <Text className="mt-2 text-3xl font-extrabold text-slate-900">97</Text>
            <Text className="text-xs text-slate-600">Parents notified today</Text>
          </GlassCard>
        </View>

        <GlassCard className="mb-5">
          <Text className="mb-3 text-lg font-bold text-slate-900">Active QR Session</Text>
          <View className="mb-4 rounded-3xl border border-brand-100 bg-white p-4">
            <Text className="text-sm font-semibold uppercase tracking-widest text-brand-600">Grade 12 - STEM A</Text>
            <Text className="mt-1 text-slate-600">Session ID: QR-1202</Text>
            <View className="mt-4 h-40 items-center justify-center rounded-2xl border border-dashed border-brand-400 bg-brand-50">
              <Text className="text-base font-semibold text-brand-600">QR Code Preview</Text>
              <Text className="mt-1 text-xs text-slate-500">Placeholder for generated QR</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity className="flex-1 rounded-2xl bg-brand-600 px-4 py-3">
              <Text className="text-center font-semibold text-white">Generate New QR</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 rounded-2xl bg-rose-600 px-4 py-3">
              <Text className="text-center font-semibold text-white">Invalidate</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        <GlassCard className="mb-5">
          <Text className="mb-3 text-lg font-bold text-slate-900">Today Sessions</Text>
          {sessionRows.map((row) => (
            <View key={row.id} className="mb-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <Text className="font-semibold text-slate-900">{row.className}</Text>
              <Text className="text-slate-600">Present: {row.present}/{row.total}</Text>
              <Text className={`mt-1 text-xs font-semibold ${row.status === "Active" ? "text-emerald-700" : "text-slate-500"}`}>
                {row.status}
              </Text>
            </View>
          ))}
        </GlassCard>

        <GlassCard className="mb-5">
          <Text className="mb-3 text-lg font-bold text-slate-900">Student Registry</Text>
          {studentRows.map((row) => (
            <View key={row.id} className="mb-2 rounded-2xl border border-slate-200 bg-white p-3">
              <Text className="font-semibold text-slate-900">{row.name}</Text>
              <Text className="text-slate-600">Student ID: {row.id}</Text>
              <Text className="text-slate-600">Parent Email: {row.parent}</Text>
            </View>
          ))}
          <TouchableOpacity className="mt-3 rounded-2xl bg-brand-100 px-4 py-3">
            <Text className="text-center font-semibold text-brand-600">Add Student / Parent Email</Text>
          </TouchableOpacity>
        </GlassCard>

        <GlassCard className="mb-5">
          <Text className="mb-3 text-lg font-bold text-slate-900">Attendance Log (Local)</Text>
          {logRows.map((row) => (
            <View key={row.id} className="mb-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <Text className="font-semibold text-slate-900">{row.name}</Text>
              <Text className="text-slate-600">{row.className}</Text>
              <Text className="text-slate-600">{row.time}</Text>
            </View>
          ))}
          <View className="mt-3 flex-row gap-3">
            <TouchableOpacity className="flex-1 rounded-2xl bg-slate-800 px-4 py-3">
              <Text className="text-center font-semibold text-white">Export CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 rounded-2xl bg-brand-600 px-4 py-3">
              <Text className="text-center font-semibold text-white">Email Summary</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        <GlassCard>
          <Text className="mb-3 text-lg font-bold text-slate-900">Email Automation</Text>
          <Text className="text-slate-600">
            Resend.com API integration placeholder for parental notifications.
          </Text>
          <TouchableOpacity className="mt-3 rounded-2xl bg-brand-600 px-4 py-3">
            <Text className="text-center font-semibold text-white">Test Email Template</Text>
          </TouchableOpacity>
          <View className="mt-3 flex-row gap-3">
            <TouchableOpacity className="flex-1 rounded-2xl bg-rose-600 px-4 py-3">
              <Text className="text-center font-semibold text-white">Emergency Alert</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 rounded-2xl bg-slate-800 px-4 py-3">
              <Text className="text-center font-semibold text-white">Teacher Absent</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}
